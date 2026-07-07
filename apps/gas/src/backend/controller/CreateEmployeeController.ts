import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateEmployeeInput,
    CreateEmployeeOutput,
    createEmployeeInput,
} from '../../shared/api/employee';
import { Authentication } from '../application/service/Authentication';
import { CreateEmployeeUseCase } from '../application/usecase/CreateEmployeeUseCase';
import { ForgotPasswordUseCase } from '../application/usecase/ForgotPasswordUseCase';

export class CreateEmployeeController {
    constructor(
        private readonly authentication: Authentication,
        private readonly createEmployeeUseCase: CreateEmployeeUseCase,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase
    ) {}

    execute(
        input: CreateEmployeeInput
    ): AppsScriptServerResponse<CreateEmployeeOutput> {
        const parsedInput = createEmployeeInput.safeParse(input);
        if (!parsedInput.success) {
            throw new InvalidArgumentError(
                'Invalid input',
                parsedInput.error.message
            );
        }

        let userId: string;
        try {
            userId = this.authentication.execute(parsedInput.data.sessionToken);
        } catch {
            throw new UnauthorizedError('Invalid session token');
        }

        const { employee, user } = this.createEmployeeUseCase.execute(
            userId,
            parsedInput.data.employee
        );

        this.forgotPasswordUseCase.execute(user.メールアドレス);
        return new AppsScriptServerResponse({
            user,
            employee,
        });
    }
}
