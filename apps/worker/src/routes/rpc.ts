import type { API } from '@mydx-pos/shared/api';
import { createPaymentRecordRequest } from '@mydx-pos/shared/api/paymentRecord';
import { z } from 'zod';
import { loginRegisterTerminalRequest } from '@mydx-pos/shared/api/registerTerminal';
import { pullDatabaseRegisterTerminalInput } from '@mydx-pos/shared/api/system';
import {
    createUserInputSchema,
    forgotPasswordInputSchema,
    loginUserInputSchema,
    logoutUserInputSchema,
    resetPasswordInputSchema,
} from '@mydx-pos/shared/api/user';
import { AuthApiError, AuthService } from '../auth/service';
import {
    badRequest,
    conflict,
    forbidden,
    methodNotAllowed,
    ok,
    parseJsonBody,
    type HttpContext,
    type HttpMethod,
    unauthorized,
    validationError,
} from '../http';
import { RegisterPaymentService } from '../registerPayment/service';

type RpcName = keyof API;
type RpcHandler = (context: HttpContext) => Promise<Response> | Response;
type AuthRpcHandler = (
    service: AuthService,
    context: HttpContext
) => Promise<Response> | Response;
type RegisterPaymentRpcHandler = (
    service: RegisterPaymentService,
    context: HttpContext
) => Promise<Response> | Response;

type RpcRoute = {
    methods: HttpMethod[];
    handler: RpcHandler;
};

const registerSessionCookieName = 'register_session';
const registerSessionMaxAge = 30 * 24 * 60 * 60;

const registerTerminalTokenRequest = z.object({
    registerTerminalToken: z.string().optional(),
});

const listRegisterTreatmentsRequest = registerTerminalTokenRequest;

const getRegisterTreatmentDetailRequest = registerTerminalTokenRequest.extend({
    treatmentId: z.string().uuidv4(),
});

const listRegisterMenusRequest = registerTerminalTokenRequest;

const createPaymentRecordCookieRequest = z.object({
    registerTerminalToken: z.string().optional(),
    paymentRecord: createPaymentRecordRequest.shape.paymentRecord,
});

const parseCookies = (header: string | null) => {
    const cookies = new Map<string, string>();
    if (!header) {
        return cookies;
    }

    for (const part of header.split(';')) {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (!rawName || rawValue.length === 0) {
            continue;
        }
        cookies.set(rawName, decodeURIComponent(rawValue.join('=')));
    }

    return cookies;
};

const registerSessionToken = (context: HttpContext) =>
    parseCookies(context.request.headers.get('cookie')).get(
        registerSessionCookieName
    ) ?? null;

const isLocalEnvironment = (env: Env) =>
    ['local', 'dev', 'development', 'test'].includes(env.ENVIRONMENT ?? '');

const registerSessionCookie = (
    env: Env,
    value: string,
    maxAge = registerSessionMaxAge
) =>
    [
        `${registerSessionCookieName}=${encodeURIComponent(value)}`,
        'HttpOnly',
        isLocalEnvironment(env) ? null : 'Secure',
        'SameSite=Strict',
        'Path=/',
        `Max-Age=${maxAge}`,
    ]
        .filter(Boolean)
        .join('; ');

const withRegisterSession = <T extends object>(
    input: T,
    context: HttpContext
) => ({
    ...input,
    registerTerminalSessionToken: registerSessionToken(context),
});

const toErrorResponse = (caught: unknown, context: HttpContext) => {
    if (!(caught instanceof AuthApiError)) {
        throw caught;
    }

    if (caught.code === 'bad_request') {
        return badRequest(caught.message, context);
    }

    if (caught.code === 'conflict') {
        return conflict(caught.message, context);
    }

    if (caught.code === 'forbidden') {
        return forbidden(caught.message, context);
    }

    if (caught.code === 'unauthorized') {
        return unauthorized(caught.message, context);
    }

    return validationError(caught.message, context);
};

const authRoute =
    (handler: AuthRpcHandler): RpcHandler =>
    async (context) => {
        try {
            return await handler(new AuthService(context.env), context);
        } catch (caught) {
            return toErrorResponse(caught, context);
        }
    };

const registerPaymentRoute =
    (handler: RegisterPaymentRpcHandler): RpcHandler =>
    async (context) => {
        try {
            return await handler(new RegisterPaymentService(context.env), context);
        } catch (caught) {
            return toErrorResponse(caught, context);
        }
    };

const rpcRoutes: Partial<Record<RpcName, RpcRoute>> = {
    isSetupCompleted: {
        methods: ['GET'],
        handler: authRoute(async (service, context) =>
            ok(await service.isSetupCompleted(), context)
        ),
    },
    isTermsAccepted: {
        methods: ['GET'],
        handler: authRoute(async (service, context) =>
            ok(await service.isTermsAccepted(), context)
        ),
    },
    acceptTerms: {
        methods: ['POST'],
        handler: authRoute(async (service, context) =>
            ok(await service.acceptTerms(), context)
        ),
    },
    createUser: {
        methods: ['POST'],
        handler: authRoute(async (service, context) => {
            const body = await parseJsonBody(context, createUserInputSchema);
            if (!body.ok) {
                return body.response;
            }

            return ok(await service.createUser(body.data), context);
        }),
    },
    loginUser: {
        methods: ['POST'],
        handler: authRoute(async (service, context) => {
            const body = await parseJsonBody(context, loginUserInputSchema);
            if (!body.ok) {
                return body.response;
            }

            return ok(await service.loginUser(body.data), context);
        }),
    },
    logoutUser: {
        methods: ['POST'],
        handler: authRoute(async (service, context) => {
            const body = await parseJsonBody(context, logoutUserInputSchema);
            if (!body.ok) {
                return body.response;
            }

            return ok(await service.logoutUser(body.data), context);
        }),
    },
    forgotPassword: {
        methods: ['POST'],
        handler: authRoute(async (service, context) => {
            const body = await parseJsonBody(context, forgotPasswordInputSchema);
            if (!body.ok) {
                return body.response;
            }

            return ok(await service.forgotPassword(body.data), context);
        }),
    },
    resetPassword: {
        methods: ['POST'],
        handler: authRoute(async (service, context) => {
            const body = await parseJsonBody(context, resetPasswordInputSchema);
            if (!body.ok) {
                return body.response;
            }

            return ok(await service.resetPassword(body.data), context);
        }),
    },
    loginRegisterTerminal: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            const body = await parseJsonBody(
                context,
                loginRegisterTerminalRequest
            );
            if (!body.ok) {
                return body.response;
            }

            const { sessionToken, registerTerminal } =
                await service.loginRegisterTerminal(body.data);

            return ok(
                { registerTerminal },
                context,
                {
                    headers: {
                        'set-cookie': registerSessionCookie(
                            context.env,
                            sessionToken
                        ),
                    },
                }
            );
        }),
    },
    logoutRegisterTerminal: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            return ok(
                await service.logoutRegisterTerminal(
                    registerSessionToken(context)
                ),
                context,
                {
                    headers: {
                        'set-cookie': registerSessionCookie(context.env, '', 0),
                    },
                }
            );
        }),
    },
    pullDatabaseRegisterTerminal: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            const body = await parseJsonBody(
                context,
                pullDatabaseRegisterTerminalInput
            );
            if (!body.ok) {
                return body.response;
            }

            return ok(
                await service.pullDatabaseRegisterTerminal(
                    body.data.registerTerminalToken
                ),
                context
            );
        }),
    },
    listRegisterTreatments: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            const body = await parseJsonBody(
                context,
                listRegisterTreatmentsRequest
            );
            if (!body.ok) {
                return body.response;
            }

            return ok(
                await service.listRegisterTreatments(
                    withRegisterSession(body.data, context)
                ),
                context
            );
        }),
    },
    getRegisterTreatmentDetail: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            const body = await parseJsonBody(
                context,
                getRegisterTreatmentDetailRequest
            );
            if (!body.ok) {
                return body.response;
            }

            return ok(
                await service.getRegisterTreatmentDetail(
                    withRegisterSession(body.data, context)
                ),
                context
            );
        }),
    },
    listRegisterMenus: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            const body = await parseJsonBody(context, listRegisterMenusRequest);
            if (!body.ok) {
                return body.response;
            }

            return ok(
                await service.listRegisterMenus(
                    withRegisterSession(body.data, context)
                ),
                context
            );
        }),
    },
    createPaymentRecord: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            const body = await parseJsonBody(
                context,
                createPaymentRecordCookieRequest
            );
            if (!body.ok) {
                return body.response;
            }

            return ok(
                await service.createPaymentRecord(
                    withRegisterSession(body.data, context)
                ),
                context
            );
        }),
    },
};

export const rpc = async (name: string, context: HttpContext) => {
    const route = rpcRoutes[name as RpcName];

    if (!route) {
        return null;
    }

    if (!route.methods.includes(context.request.method as HttpMethod)) {
        return methodNotAllowed([...route.methods, 'OPTIONS'], context);
    }

    return route.handler(context);
};
