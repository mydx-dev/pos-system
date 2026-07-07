import { ok, type HttpContext } from '../http';
import { pingD1 } from '../db/d1';

export const health = async (env: Env, context: HttpContext) => {
    const isD1Ready = await pingD1(env.DB);

    return ok(
        {
            status: 'ok',
            d1: isD1Ready ? 'ok' : 'unknown',
            checkedAt: new Date().toISOString(),
        },
        context
    );
};
