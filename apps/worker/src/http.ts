export type ApiSuccess<T> = {
    ok: true;
    data: T;
};

export type ApiFailure = {
    ok: false;
    error: {
        code: string;
        message: string;
    };
};

export type HttpMethod = 'GET' | 'POST' | 'OPTIONS';

export type HttpContext = {
    env: Env;
    request: Request;
};

type JsonParser<T> = {
    safeParse: (input: unknown) =>
        | {
              success: true;
              data: T;
          }
        | {
              success: false;
          };
};

const localOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8787',
    'http://127.0.0.1:8787',
];

const parseAllowedOrigins = (env: Env) => {
    const configuredOrigins = env.CORS_ALLOWED_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    return env.ENVIRONMENT === 'local'
        ? [...new Set([...configuredOrigins, ...localOrigins])]
        : configuredOrigins;
};

const corsHeaders = ({ env, request }: HttpContext) => {
    const origin = request.headers.get('origin');
    const headers: HeadersInit = {
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type,authorization',
        vary: 'Origin',
    };

    // Authentication is expected to use Bearer tokens in Authorization, not browser credentials.
    if (origin && parseAllowedOrigins(env).includes(origin)) {
        headers['access-control-allow-origin'] = origin;
    }

    return headers;
};

const responseHeaders = (context: HttpContext, init?: ResponseInit) => ({
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
    'cache-control': 'no-store',
    ...corsHeaders(context),
    ...init?.headers,
});

export const json = <T>(
    body: ApiSuccess<T> | ApiFailure,
    context: HttpContext,
    init?: ResponseInit
) =>
    Response.json(body, {
        ...init,
        headers: responseHeaders(context, init),
    });

export const ok = <T>(data: T, context: HttpContext, init?: ResponseInit) =>
    json<T>({ ok: true, data }, context, init);

export const error = (
    code: string,
    message: string,
    context: HttpContext,
    init: ResponseInit = { status: 500 }
) =>
    json<never>(
        {
            ok: false,
            error: { code, message },
        },
        context,
        init
    );

export const badRequest = (message: string, context: HttpContext) =>
    error('bad_request', message, context, { status: 400 });

export const unauthorized = (message: string, context: HttpContext) =>
    error('unauthorized', message, context, { status: 401 });

export const forbidden = (message: string, context: HttpContext) =>
    error('forbidden', message, context, { status: 403 });

export const notFound = (context: HttpContext) =>
    error('not_found', 'The requested endpoint was not found.', context, {
        status: 404,
    });

export const methodNotAllowed = (
    allowedMethods: HttpMethod[],
    context: HttpContext
) =>
    error(
        'method_not_allowed',
        'The requested method is not allowed for this endpoint.',
        context,
        {
            status: 405,
            headers: {
                allow: allowedMethods.join(', '),
            },
        }
    );

export const conflict = (message: string, context: HttpContext) =>
    error('conflict', message, context, { status: 409 });

export const validationError = (message: string, context: HttpContext) =>
    error('validation_error', message, context, { status: 422 });

export const internalServerError = (context: HttpContext) =>
    error('internal_server_error', 'Unexpected worker error.', context);

export const options = (context: HttpContext) =>
    new Response(null, {
        status: 204,
        headers: {
            ...corsHeaders(context),
            'x-content-type-options': 'nosniff',
            'cache-control': 'no-store',
        },
    });

export const parseJsonBody = async <T = unknown>(
    context: HttpContext,
    parser?: JsonParser<T>
) => {
    const { request } = context;
    const contentType = request.headers.get('content-type') ?? '';

    if (!contentType.toLowerCase().includes('application/json')) {
        return {
            ok: false,
            response: badRequest(
                'Content-Type must be application/json.',
                context
            ),
        } as const;
    }

    try {
        const body: unknown = await request.json();

        if (!parser) {
            return { ok: true, data: body as T } as const;
        }

        const parsed = parser.safeParse(body);

        if (!parsed.success) {
            return {
                ok: false,
                response: validationError(
                    'Request body validation failed.',
                    context
                ),
            } as const;
        }

        return { ok: true, data: parsed.data } as const;
    } catch {
        return {
            ok: false,
            response: badRequest('Request body must be valid JSON.', context),
        } as const;
    }
};
