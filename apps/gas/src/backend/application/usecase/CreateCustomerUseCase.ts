import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateCustomerInput,
    CreateCustomerOutput,
} from '../../../shared/api/customer';
import {
    ALL_TABLES,
    CustomerTable,
} from '../../infrastructure/database/tables';
import { PermissionCheck } from '../service/PermissionCheck';

export class CreateCustomerUseCase {
    constructor(
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}

    execute(
        userId: string,
        customer: CreateCustomerInput['customer']
    ): CreateCustomerOutput {
        if (!userId) {
            throw new InvalidArgumentError('User ID is required');
        }

        if (!this.permissionCheck.isApprovedSystemAdminOrEmployee(userId)) {
            throw new ForbiddenError(
                'You do not have permission to perform this action'
            );
        }

        if (customer.主担当スタッフID) {
            const staff = this.db
                .table('スタッフ')
                .find(
                    this.db
                        .query('スタッフ')
                        .and('ユーザーID', '=', [customer.主担当スタッフID])
                );

            if (staff.length === 0) {
                throw new InvalidArgumentError('Primary staff not found');
            }
        }

        const newCustomer = this.db.table('顧客').create([
            {
                氏名: customer.氏名,
                主担当スタッフID: customer.主担当スタッフID,
                担当固定: customer.担当固定 ?? false,
                メールアドレス: customer.メールアドレス,
                電話番号: customer.電話番号,
                生年月日: customer.生年月日,
                郵便番号: customer.郵便番号,
                住所: customer.住所,
                備考: customer.備考,
                バージョン: 1,
            },
        ])[0];

        return {
            customer: CustomerTable.serialize(newCustomer),
        };
    }
}
