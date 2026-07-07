import {
    internalServerError,
    methodNotAllowed,
    notFound,
    options,
} from './http';
import { health } from './routes/health';
import { rpc } from './routes/rpc';

export default {
    async fetch(request, env): Promise<Response> {
        const context = { env, request };

        if (request.method === 'OPTIONS') {
            return options(context);
        }

        const url = new URL(request.url);

        try {
            if (url.pathname === '/health') {
                if (request.method !== 'GET') {
                    return methodNotAllowed(['GET', 'OPTIONS'], context);
                }

                return await health(env, context);
            }

            if (url.pathname.startsWith('/rpc/')) {
                const response = await rpc(
                    url.pathname.replace('/rpc/', ''),
                    context
                );
                return response ?? notFound(context);
            }

            return notFound(context);
        } catch (caught) {
            console.error(
                JSON.stringify({
                    level: 'error',
                    message: caught instanceof Error ? caught.message : String(caught),
                    path: url.pathname,
                })
            );

            return internalServerError(context);
        }
    },
} satisfies ExportedHandler<Env>;
