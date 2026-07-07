import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import { SaveMenuRequest, SaveMenuResponse } from '@mydx-pos/shared/api/menu';
import { ALL_TABLES, MenuTable } from '../../infrastructure/database/tables';
import { PermissionCheck } from '../service/PermissionCheck';

export class SaveMenuUseCase {
    constructor(
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}

    execute(
        userId: string,
        { menus, deletedMenuIds }: SaveMenuRequest
    ): SaveMenuResponse {
        if (!userId) {
            throw new InvalidArgumentError('User not found');
        }

        const { hasRole } = this.permissionCheck.hasRole(
            userId,
            'システム管理者'
        );
        if (!hasRole) {
            throw new ForbiddenError(
                'You do not have permission to perform this action'
            );
        }

        const { savedMenus } = this.db.transaction(() => {
            const savedMenus = this.db.table('メニュー').upsert(
                menus.map((menu) => {
                    return MenuTable.deserialize(menu);
                })
            );

            if (deletedMenuIds.length > 0) {
                this.db.table('メニュー').delete(deletedMenuIds);
            }

            return { savedMenus };
        });

        return {
            menus: savedMenus.map((menu) => MenuTable.serialize(menu)),
            deletedMenuIds,
        };
    }
}
