import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateTreatmentRequest,
    CreateTreatmentResponse,
} from '../../../shared/api/treatment';
import { TreatmentStatus } from '../../../shared/domain/entity/Treatment';
import { TreatmentDuration } from '../../../shared/domain/valueObject/TreatmentDuration';
import { TreatmentEndDate } from '../../../shared/domain/valueObject/TreatmentEndDate';
import { TreatmentStartDate } from '../../../shared/domain/valueObject/TreatmentStartDate';
import {
    ALL_TABLES,
    TreatmentMenuTable,
    TreatmentTable,
} from '../../infrastructure/database/tables';
import { ExistsCheck } from '../service/ExistsCheck';
import { PermissionCheck } from '../service/PermissionCheck';

export class CreateTreatmentUseCase {
    constructor(
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>,
        private readonly existsCheck: ExistsCheck
    ) {}

    execute(
        userId: string,
        {
            treatment,
            treatmentMenus,
        }: Pick<CreateTreatmentRequest, 'treatment' | 'treatmentMenus'>
    ): CreateTreatmentResponse {
        if (!userId) {
            throw new InvalidArgumentError('User ID is required');
        }

        if (!this.permissionCheck.isApprovedSystemAdminOrEmployee(userId)) {
            throw new ForbiddenError(
                'You do not have permission to perform this action'
            );
        }

        const startDate = new TreatmentStartDate(treatment.開始日時);
        const treatmentDuration = new TreatmentDuration(treatment.所要時間);

        if (!this.existsCheck.hasCustomer(treatment.顧客ID)) {
            throw new InvalidArgumentError('Customer not found');
        }

        if (!this.existsCheck.hasStaff(treatment.担当スタッフID)) {
            throw new InvalidArgumentError('Staff not found');
        }

        const menuIds = treatmentMenus.map((menu) => menu.メニューID);
        const menus =
            menuIds.length === 0
                ? []
                : this.db
                      .table('メニュー')
                      .find(this.db.query('メニュー').and('ID', '=', menuIds));
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

            return {
                メニューID: menu.id,
                メニュー名: menu.name,
                通常価格: menu.price,
                数量: treatmentMenu.数量,
                値引き額: treatmentMenu.値引き額,
                表示順: treatmentMenu.表示順,
                バージョン: 1,
            };
        });

        const { savedTreatment, savedTreatmentMenus } = this.db.transaction(
            () => {
                const savedTreatment = this.db.table('施術').create([
                    {
                        顧客ID: treatment.顧客ID,
                        担当スタッフID: treatment.担当スタッフID,
                        状態: treatment.状態 ?? ('予約済み' as TreatmentStatus),
                        開始日時: treatment.開始日時,
                        所要時間: treatmentDuration.value,
                        備考: treatment.備考,
                        バージョン: 1,
                    },
                ])[0];

                const savedTreatmentMenus =
                    treatmentMenuRecords.length === 0
                        ? []
                        : this.db.table('施術メニュー').create(
                              treatmentMenuRecords.map((menu) => ({
                                  ...menu,
                                  施術ID: savedTreatment.id,
                              }))
                          );

                return {
                    savedTreatment,
                    savedTreatmentMenus,
                };
            }
        );

        return {
            treatment: {
                ...TreatmentTable.serialize(savedTreatment),
                終了日時: new TreatmentEndDate(startDate, treatmentDuration)
                    .value,
            },
            treatmentMenus: savedTreatmentMenus.map((menu) =>
                TreatmentMenuTable.serialize(menu)
            ),
        };
    }
}
