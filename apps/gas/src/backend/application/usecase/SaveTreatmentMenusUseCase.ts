import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    SaveTreatmentMenusRequest,
    SaveTreatmentMenusResponse,
} from '../../../shared/api/treatment';
import {
    ALL_TABLES,
    TreatmentMenuTable,
} from '../../infrastructure/database/tables';
import { ExistsCheck } from '../service/ExistsCheck';
import { PermissionCheck } from '../service/PermissionCheck';

export class SaveTreatmentMenusUseCase {
    constructor(
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>,
        private readonly existsCheck: ExistsCheck
    ) {}

    execute(
        userId: string,
        {
            treatmentId,
            treatmentMenus,
            deletedTreatmentMenuIds,
        }: SaveTreatmentMenusRequest
    ): SaveTreatmentMenusResponse {
        if (!userId) {
            throw new InvalidArgumentError('User ID is required');
        }

        if (
            !this.permissionCheck.isApprovedSystemAdminOrEmployeeOrRegisterTerminal(
                userId
            )
        ) {
            throw new ForbiddenError(
                'You do not have permission to perform this action'
            );
        }

        const treatment = this.db
            .table('施術')
            .find(
                this.db
                    .query('施術')
                    .and('ID', '=', [treatmentId])
                    .join('ID', '施術メニュー', '施術ID')
            )[0];

        if (!treatment) {
            throw new InvalidArgumentError('Treatment not found');
        }

        const ids: { treatmentIds: string[]; menuIds: string[] } = {
            treatmentIds: [],
            menuIds: [],
        };

        treatmentMenus.forEach((treatmentMenu) => {
            ids.treatmentIds.push(treatmentMenu.ID);
            ids.menuIds.push(treatmentMenu.メニューID);
        });

        [...ids.treatmentIds, ...deletedTreatmentMenuIds].forEach(
            (treatmentMenuId) => {
                if (treatmentMenuId === '') return;
                if (!treatment.hasMenu(treatmentMenuId)) {
                    throw new InvalidArgumentError('Treatment menu not found');
                }
            }
        );

        const menus = this.db
            .table('メニュー')
            .find(this.db.query('メニュー').and('ID', '=', ids.menuIds));
        const menuById = new Map(menus.map((menu) => [menu.id, menu]));
        this.existsCheck.cacheMenuIds(menus.map((menu) => menu.id));

        const treatmentMenuRecords = treatmentMenus.map((treatmentMenu) => {
            if (!this.existsCheck.hasMenu(treatmentMenu.メニューID)) {
                throw new InvalidArgumentError('Menu not found');
            }
            const menu = menuById.get(treatmentMenu.メニューID);
            if (!menu) {
                throw new InvalidArgumentError('Menu not found');
            }

            if (treatmentMenu.値引き額 > menu.price) {
                throw new InvalidArgumentError(
                    'Discount amount must not exceed regular price'
                );
            }

            return TreatmentMenuTable.deserialize({
                ID: treatmentMenu.ID,
                施術ID: treatmentId,
                メニューID: menu.id,
                メニュー名: menu.name,
                通常価格: menu.price,
                数量: treatmentMenu.数量,
                値引き額: treatmentMenu.値引き額,
                表示順: treatmentMenu.表示順,
                バージョン: treatmentMenu.バージョン ?? 1,
            });
        });

        const upserted = this.db.transaction(() => {
            const saved =
                treatmentMenuRecords.length > 0
                    ? this.db.table('施術メニュー').upsert(treatmentMenuRecords)
                    : [];

            if (deletedTreatmentMenuIds.length > 0) {
                this.db.table('施術メニュー').delete(deletedTreatmentMenuIds);
            }
            return saved;
        });

        const upsertedIds = upserted.map((treatmentMenu) => treatmentMenu.id);
        const savedTreatmentMenus = [
            ...upserted,
            ...treatment.treatmentMenus.filter((treatmentMenu) => {
                return (
                    !upsertedIds.includes(treatmentMenu.id) &&
                    !deletedTreatmentMenuIds.includes(treatmentMenu.id)
                );
            }),
        ].sort((a, b) => a.displayOrder - b.displayOrder);

        return {
            treatmentMenus: savedTreatmentMenus.map(
                TreatmentMenuTable.serialize
            ),
            deletedTreatmentMenuIds,
        };
    }
}
