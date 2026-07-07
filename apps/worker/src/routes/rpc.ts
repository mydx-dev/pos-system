import type { API } from '@mydx-pos/shared/api';
import {
    methodNotAllowed,
    ok,
    type HttpContext,
    type HttpMethod,
} from '../http';

type RpcName = keyof API;
type RpcHandler = (context: HttpContext) => Promise<Response> | Response;

type RpcRoute = {
    methods: HttpMethod[];
    handler: RpcHandler;
};

const rpcRoutes: Partial<Record<RpcName, RpcRoute>> = {
    isSetupCompleted: {
        methods: ['GET'],
        handler: (context) => ok(false, context),
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
