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

const jsonHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
};

export const json = <T>(body: ApiSuccess<T> | ApiFailure, init?: ResponseInit) =>
    Response.json(body, {
        ...init,
        headers: {
            ...jsonHeaders,
            ...init?.headers,
        },
    });

export const ok = <T>(data: T, init?: ResponseInit) =>
    json<T>({ ok: true, data }, init);

export const error = (
    code: string,
    message: string,
    init: ResponseInit = { status: 500 }
) =>
    json<never>(
        {
            ok: false,
            error: { code, message },
        },
        init
    );

export const options = () => new Response(null, { headers: jsonHeaders });
