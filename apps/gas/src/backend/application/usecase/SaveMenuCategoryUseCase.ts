import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    SaveMenuCategoryRequest,
    SaveMenuCategoryResponse,
} from '@mydx-pos/shared/api/menuCategory';
import {
    ALL_TABLES,
    MenuCategoryTable,
} from '../../infrastructure/database/tables';
import { PermissionCheck } from '../service/PermissionCheck';

export class SaveMenuCategoryUseCase {
    constructor(
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}
    execute(
        userId: string,
        { menuCategories, deletedMenuCategoryIds }: SaveMenuCategoryRequest
    ): SaveMenuCategoryResponse {
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

        const { savedCategories } = this.db.transaction(() => {
            const savedCategories = this.db.table('メニューカテゴリー').upsert(
                menuCategories.map((category) => {
                    return MenuCategoryTable.deserialize(category);
                })
            );

            if (deletedMenuCategoryIds.length > 0) {
                this.db
                    .table('メニューカテゴリー')
                    .delete(deletedMenuCategoryIds);
            }

            return { savedCategories };
        });

        return {
            menuCategories: savedCategories.map((category) =>
                MenuCategoryTable.serialize(category)
            ),
            deletedMenuCategoryIds,
        };
    }
}
