import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { PullDatabaseRegisterTerminalOutput } from '@mydx-pos/shared/api/system';
import {
    ALL_TABLES,
    CustomerTable,
    EmployeeTable,
    MenuCategoryTable,
    MenuTable,
    PaymentRecordTable,
    TreatmentMenuTable,
    TreatmentTable,
    UserTable,
} from '../../infrastructure/database/tables';

const syncTable = (
    table:
        | typeof CustomerTable
        | typeof EmployeeTable
        | typeof UserTable
        | typeof TreatmentTable
        | typeof TreatmentMenuTable
        | typeof MenuTable
        | typeof MenuCategoryTable
        | typeof PaymentRecordTable
) => ({
    name: table.name,
    primaryKey: table.primaryKey as string,
});

export class PullDataBaseRegisterTerminalUseCase {
    constructor(private db: SheetDB<typeof ALL_TABLES>) {}

    execute(): PullDatabaseRegisterTerminalOutput {
        const result: PullDatabaseRegisterTerminalOutput = [];

        const customers = this.db.table('顧客').find(this.db.query('顧客'));
        result.push({
            table: syncTable(CustomerTable),
            records: customers.map((customer) =>
                CustomerTable.serialize(customer)
            ),
        });

        const employees = this.db.table('スタッフ').find();
        result.push({
            table: syncTable(EmployeeTable),
            records: employees.map((employee) =>
                EmployeeTable.serialize(employee)
            ),
        });

        const users = this.db.table('ユーザー').find(this.db.query('ユーザー'));
        result.push({
            table: syncTable(UserTable),
            records: users.map((user) => user.serializeEmptyPassword()),
        });

        const treatments = this.db.table('施術').find(this.db.query('施術'));
        result.push({
            table: syncTable(TreatmentTable),
            records: treatments.map((treatment) =>
                TreatmentTable.serialize(treatment)
            ),
        });

        const treatmentMenus = this.db
            .table('施術メニュー')
            .find(this.db.query('施術メニュー'));
        result.push({
            table: syncTable(TreatmentMenuTable),
            records: treatmentMenus.map((treatmentMenu) =>
                TreatmentMenuTable.serialize(treatmentMenu)
            ),
        });

        const menus = this.db.table('メニュー').find(this.db.query('メニュー'));
        result.push({
            table: syncTable(MenuTable),
            records: menus.map((menu) => MenuTable.serialize(menu)),
        });

        const menuCategories = this.db
            .table('メニューカテゴリー')
            .find(this.db.query('メニューカテゴリー'));
        result.push({
            table: syncTable(MenuCategoryTable),
            records: menuCategories.map((menuCategory) =>
                MenuCategoryTable.serialize(menuCategory)
            ),
        });

        const paymentRecords = this.db
            .table('精算履歴')
            .find(this.db.query('精算履歴'));
        result.push({
            table: syncTable(PaymentRecordTable),
            records: paymentRecords.map((paymentRecord) =>
                PaymentRecordTable.serialize(paymentRecord)
            ),
        });

        return result;
    }
}
