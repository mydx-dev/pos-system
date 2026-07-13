import type {
    CreateUserInput,
    ForgotPasswordInput,
    LoginUserInput,
    ResetPasswordInput,
} from '@mydx-pos/shared/api/user';
import { createAuth } from './createAuth';
import {
    AuthRepository,
    betterAuthManagedPasswordMarker,
} from '../db/authRepository';
import { hashPassword, hashToken, randomToken } from './crypto';
import { validatePassword } from './password';

const SESSION_TTL_MS = 20 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export class AuthApiError extends Error {
    constructor(
        readonly code:
            | 'bad_request'
            | 'conflict'
            | 'forbidden'
            | 'not_found'
            | 'unauthorized'
            | 'validation_error',
        message: string
    ) {
        super(message);
    }
}

const requirePasswordPepper = (env: Env) => {
    const pepper = env.PASSWORD_PEPPER;
    if (!pepper) {
        throw new AuthApiError(
            'bad_request',
            'PASSWORD_PEPPER is not configured.'
        );
    }
    return pepper;
};

const internalAuthBaseURL = (env: Env) =>
    env.BETTER_AUTH_URL || 'http://localhost:8787';

const internalAuthHeaders = (env: Env) =>
    new Headers({
        origin: internalAuthBaseURL(env),
    });

export class AuthService {
    private readonly repository: AuthRepository;

    constructor(private readonly env: Env) {
        this.repository = new AuthRepository(env.DB);
    }

    isSetupCompleted() {
        return this.repository.isSetupCompleted();
    }

    isTermsAccepted() {
        return this.repository.isTermsAccepted();
    }

    async acceptTerms() {
        await this.repository.setBooleanSetting('terms_accepted', true);
        return true;
    }

    async createUser(input: CreateUserInput) {
        const passwordError = validatePassword(input.password);
        if (passwordError) {
            throw new AuthApiError('validation_error', passwordError);
        }

        const adminCount = await this.repository.countSystemAdmins();
        const isFirstSetupRequest = adminCount === 0;
        const hasSetupLock = isFirstSetupRequest
            ? await this.repository.tryAcquireSetupLock()
            : false;

        if (isFirstSetupRequest && !hasSetupLock) {
            throw new AuthApiError(
                'conflict',
                'Initial setup is already running.'
            );
        }

        const isFirstAdmin = hasSetupLock;
        let signedUp: Awaited<
            ReturnType<ReturnType<typeof createAuth>['api']['signUpEmail']>
        >;

        try {
            const auth = createAuth(this.env, internalAuthBaseURL(this.env), {
                disableSignUp: false,
            });
            signedUp = await auth.api.signUpEmail({
                body: {
                    name: input.name,
                    email: input.email,
                    password: input.password,
                },
                headers: internalAuthHeaders(this.env),
            });
        } catch (caught) {
            if (hasSetupLock) {
                await this.repository.releaseSetupLock();
            }
            if (caught instanceof Error && caught.message.includes('exists')) {
                throw new AuthApiError('conflict', 'User already exists.');
            }
            throw caught;
        }

        const userId = signedUp.user.id;

        try {
            await this.repository.createUser({
                id: userId,
                name: input.name,
                email: input.email,
                passwordHash: betterAuthManagedPasswordMarker,
                approval: isFirstAdmin,
                role: isFirstAdmin ? 'システム管理者' : 'ユーザー',
            });
        } catch (caught) {
            await this.repository.deleteBetterAuthUser(userId);
            if (caught instanceof Error && caught.message.includes('UNIQUE')) {
                if (hasSetupLock) {
                    await this.repository.releaseSetupLock();
                }
                throw new AuthApiError('conflict', 'User already exists.');
            }
            if (hasSetupLock) {
                await this.repository.releaseSetupLock();
            }
            throw caught;
        }

        if (isFirstAdmin) {
            await this.repository.setBooleanSetting('setup_completed', true);
        }

        return {
            id: userId,
            name: input.name,
            email: input.email,
        };
    }

    async loginUser(input: LoginUserInput) {
        const user = await this.repository.findApprovedUserByEmail(input.email);
        if (!user) {
            throw new AuthApiError(
                'unauthorized',
                'Invalid email or password.'
            );
        }

        if (user.password === betterAuthManagedPasswordMarker) {
            const auth = createAuth(this.env, internalAuthBaseURL(this.env));
            const signedIn = await auth.api
                .signInEmail({
                    body: {
                        email: input.email,
                        password: input.password,
                        rememberMe: false,
                    },
                    headers: internalAuthHeaders(this.env),
                })
                .catch(() => null);

            if (!signedIn) {
                throw new AuthApiError(
                    'unauthorized',
                    'Invalid email or password.'
                );
            }

            const profile =
                await this.repository.findApprovedUserProfileByEmail(
                    signedIn.user.email
                );
            if (!profile || profile.id !== signedIn.user.id) {
                throw new AuthApiError(
                    'forbidden',
                    'Approved user is required.'
                );
            }

            return {
                sessionToken: signedIn.token,
                userId: signedIn.user.id,
            };
        }

        const passwordHash = await hashPassword(
            input.password,
            user.id,
            requirePasswordPepper(this.env)
        );
        if (passwordHash !== user.password) {
            throw new AuthApiError(
                'unauthorized',
                'Invalid email or password.'
            );
        }

        const sessionToken = randomToken();
        await this.repository.createSession(
            await hashToken(sessionToken),
            user.id,
            Date.now() + SESSION_TTL_MS
        );

        return {
            sessionToken,
            userId: user.id,
        };
    }

    async logoutUser(sessionToken: string) {
        await this.repository.deleteSession(await hashToken(sessionToken));
        return { ok: true };
    }

    async forgotPassword(input: ForgotPasswordInput) {
        const user = await this.repository.findUserByEmail(input.email);
        if (!user) {
            return { ok: true };
        }

        const rawResetToken = randomToken();
        await this.repository.replacePasswordReset(
            user.id,
            await hashToken(rawResetToken),
            Date.now() + PASSWORD_RESET_TTL_MS
        );
        // Email delivery is intentionally left for a provider-specific follow-up.

        return { ok: true };
    }

    async resetPassword(input: ResetPasswordInput) {
        if (!input.token) {
            throw new AuthApiError('validation_error', 'Token is required.');
        }

        const passwordError = validatePassword(input.newPassword);
        if (passwordError) {
            throw new AuthApiError('validation_error', passwordError);
        }

        const reset = await this.repository.findUserByResetTokenHash(
            await hashToken(input.token)
        );
        if (!reset || reset.expires_at < Date.now()) {
            throw new AuthApiError('forbidden', 'Invalid or expired token.');
        }

        await this.repository.createBetterAuthPasswordResetVerification(
            input.token,
            reset.id,
            reset.expires_at
        );

        const auth = createAuth(this.env, internalAuthBaseURL(this.env));
        await auth.api.resetPassword({
            body: {
                token: input.token,
                newPassword: input.newPassword,
            },
            headers: internalAuthHeaders(this.env),
        });

        await this.repository.markPasswordAsBetterAuthManaged(reset.id);

        return { ok: true };
    }
}
