import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { drizzle } from 'drizzle-orm/d1';
import * as authSchema from '../db/authSchema';

const managementSessionTtlSeconds = 20 * 60;

const localTrustedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:8787',
    'http://127.0.0.1:8787',
];

const splitOrigins = (value: string | undefined) =>
    (value ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

const isLocalEnvironment = (env: Env) =>
    ['local', 'dev', 'development', 'test'].includes(env.ENVIRONMENT ?? '');

export const trustedOrigins = (env: Env, baseURL: string) => {
    const configured = splitOrigins(env.TRUSTED_ORIGINS);
    const corsOrigins = splitOrigins(env.CORS_ALLOWED_ORIGINS);
    const localOrigins = isLocalEnvironment(env) ? localTrustedOrigins : [];

    return [...new Set([baseURL, ...configured, ...corsOrigins, ...localOrigins])];
};

type CreateAuthOptions = {
    disableSignUp?: boolean;
};

export const createAuth = (
    env: Env,
    baseURL: string,
    options: CreateAuthOptions = {}
) => {
    const db = drizzle(env.DB, {
        schema: authSchema,
    });

    return betterAuth({
        appName: 'MYDX POS',
        baseURL: env.BETTER_AUTH_URL || baseURL,
        basePath: '/api/auth',
        secret: env.BETTER_AUTH_SECRET,
        trustedOrigins: trustedOrigins(env, baseURL),
        database: drizzleAdapter(db, {
            provider: 'sqlite',
            schema: authSchema,
        }),
        emailAndPassword: {
            enabled: true,
            disableSignUp: options.disableSignUp ?? true,
            autoSignIn: false,
        },
        session: {
            expiresIn: managementSessionTtlSeconds,
            updateAge: 0,
        },
        advanced: {
            useSecureCookies: !isLocalEnvironment(env),
            defaultCookieAttributes: {
                httpOnly: true,
                sameSite: 'lax',
                secure: !isLocalEnvironment(env),
                path: '/',
            },
        },
    });
};
