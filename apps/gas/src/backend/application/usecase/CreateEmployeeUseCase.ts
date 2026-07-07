import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateEmployeeInput,
    CreateEmployeeOutput,
} from '@mydx-pos/shared/api/employee';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PermissionCheck } from '../service/PermissionCheck';

export class CreateEmployeeUseCase {
    constructor(
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}

    execute(
        userId: string,
        employee: CreateEmployeeInput['employee']
    ): CreateEmployeeOutput {
        if (!userId) {
            throw new InvalidArgumentError('User ID is required');
        }

        const roleCheckResult = this.permissionCheck.hasRole(
            userId,
            'システム管理者'
        );

        if (!roleCheckResult.hasRole) {
            throw new ForbiddenError('User does not have the required role');
        }

        const newEmployee = this.db.table('ユーザー').create([
            {
                氏名: employee.氏名,
                メールアドレス: employee.メールアドレス,
                パスワード: '',
                承認: true,
                バージョン: 1,
                relations: {
                    スタッフ: [{}],
                },
            },
        ])[0];

        return {
            user: {
                ID: newEmployee.id,
                氏名: newEmployee.name,
                メールアドレス: newEmployee.email,
                パスワード: newEmployee.password,
                承認: newEmployee.approval,
                バージョン: newEmployee.version,
            },
            employee: {
                ユーザーID: newEmployee.id,
            },
        };
    }
}
