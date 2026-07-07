import { error, options } from './http';
import { health } from './routes/health';
import { rpc } from './routes/rpc';

const notFound = () =>
    error('not_found', 'The requested endpoint was not found.', {
        status: 404,
    });

export default {
    async fetch(request, env): Promise<Response> {
        if (request.method === 'OPTIONS') {
            return options();
        }

        const url = new URL(request.url);

        try {
            if (request.method === 'GET' && url.pathname === '/health') {
                return await health(env);
            }

            if (url.pathname.startsWith('/rpc/')) {
                const response = await rpc(url.pathname.replace('/rpc/', ''));
                return response ?? notFound();
            }

            return notFound();
        } catch (caught) {
            console.error(
                JSON.stringify({
                    level: 'error',
                    message: caught instanceof Error ? caught.message : String(caught),
                    path: url.pathname,
                })
            );

            return error('internal_server_error', 'Unexpected worker error.');
        }
    },
} satisfies ExportedHandler<Env>;
