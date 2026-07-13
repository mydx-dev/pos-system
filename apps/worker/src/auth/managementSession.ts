import type { RoleName } from '@mydx-pos/shared/domain/entity/Role';
import { createAuth } from './createAuth';
import { forbidden, unauthorized, type HttpContext } from '../http';

export type ManagementUser = {
    authUserId: string;
    posUserId: string;
    email: string;
    name: string;
    role: RoleName;
};

export type ManagementSession =
      | {
          ok: true;
          auth: ReturnType<typeof createAuth>;
          user: ManagementUser;
      }
    | {
          ok: false;
          response: Response;
      };

const findApprovedProfile = async (env: Env, authUserId: string) =>
    env.DB.prepare(
        `SELECT
            users.id,
            users.name,
            users.email,
            roles.name AS role
         FROM users
         INNER JOIN roles ON roles.user_id = users.id
         WHERE users.id = ? AND users.approval = 1
         LIMIT 1`
    )
        .bind(authUserId)
        .first<{
            id: string;
            name: string;
            email: string;
            role: RoleName;
        }>();

export const requireManagementSession = async (
    context: HttpContext
): Promise<ManagementSession> => {
    const baseURL = new URL(context.request.url).origin;
    const auth = createAuth(context.env, baseURL);
    const session = await auth.api.getSession({
        headers: context.request.headers,
    });

    if (!session) {
        return {
            ok: false,
            response: unauthorized('Authentication is required.', context),
        };
    }

    const profile = await findApprovedProfile(context.env, session.user.id);
    if (!profile) {
        return {
            ok: false,
            response: forbidden('Approved POS user profile is required.', context),
        };
    }

    return {
        ok: true,
        auth,
        user: {
            authUserId: session.user.id,
            posUserId: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
        },
    };
};
