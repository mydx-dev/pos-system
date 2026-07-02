import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateCustomerInput,
    CreateCustomerOutput,
    createCustomerInput,
} from '../../shared/api/customer';
import { Authentication } from '../application/service/Authentication';
import { CreateCustomerUseCase } from '../application/usecase/CreateCustomerUseCase';

export class CreateCustomerController {
    constructor(
        private readonly authentication: Authentication,
        private readonly createCustomerUseCase: CreateCustomerUseCase
    ) {}

    execute(
        input: CreateCustomerInput
    ): AppsScriptServerResponse<CreateCustomerOutput> {
        const parsedInput = createCustomerInput.safeParse(input);
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

        const result = this.createCustomerUseCase.execute(
            userId,
            parsedInput.data.customer
        );

        return new AppsScriptServerResponse(result);
    }
}
