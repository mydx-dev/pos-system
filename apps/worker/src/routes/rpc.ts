import type { API } from '@mydx-pos/shared/api';
import { createPaymentRecordRequest } from '@mydx-pos/shared/api/paymentRecord';
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

            return ok(await service.loginRegisterTerminal(body.data), context);
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
    createPaymentRecord: {
        methods: ['POST'],
        handler: registerPaymentRoute(async (service, context) => {
            const body = await parseJsonBody(context, createPaymentRecordRequest);
            if (!body.ok) {
                return body.response;
            }

            return ok(await service.createPaymentRecord(body.data), context);
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
