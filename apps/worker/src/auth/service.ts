import type {
    CreateUserInput,
    ForgotPasswordInput,
    LoginUserInput,
    ResetPasswordInput,
} from '@mydx-pos/shared/api/user';
import { AuthRepository } from '../db/authRepository';
import { hashPassword, hashToken, randomId, randomToken } from './crypto';
import { validatePassword } from './password';

const SESSION_TTL_MS = 20 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export class AuthApiError extends Error {
    constructor(
        readonly code:
            | 'bad_request'
            | 'conflict'
            | 'forbidden'
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

        const userId = randomId();
        const adminCount = await this.repository.countSystemAdmins();
        const isFirstAdmin = adminCount === 0;
        const passwordHash = await hashPassword(
            input.password,
            userId,
            requirePasswordPepper(this.env)
        );

        try {
            await this.repository.createUser({
                id: userId,
                name: input.name,
                email: input.email,
                passwordHash,
                approval: isFirstAdmin,
                role: isFirstAdmin ? 'システム管理者' : 'ユーザー',
            });
        } catch (caught) {
            if (caught instanceof Error && caught.message.includes('UNIQUE')) {
                throw new AuthApiError('conflict', 'User already exists.');
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
            throw new AuthApiError('unauthorized', 'Invalid email or password.');
        }

        const passwordHash = await hashPassword(
            input.password,
            user.id,
            requirePasswordPepper(this.env)
        );
        if (passwordHash !== user.password) {
            throw new AuthApiError('unauthorized', 'Invalid email or password.');
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

        await this.repository.replacePasswordReset(
            user.id,
            randomToken(),
            Date.now() + PASSWORD_RESET_TTL_MS
        );

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

        const reset = await this.repository.findUserByResetToken(input.token);
        if (!reset || reset.expires_at < Date.now()) {
            throw new AuthApiError('forbidden', 'Invalid or expired token.');
        }

        await this.repository.updatePassword(
            reset.id,
            await hashPassword(
                input.newPassword,
                reset.id,
                requirePasswordPepper(this.env)
            )
        );

        return { ok: true };
    }
}
