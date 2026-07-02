import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreatePaymentRecordRequest,
    CreatePaymentRecordResponse,
    createPaymentRecordRequest,
} from '../../shared/api/paymentRecord';
import { Authentication } from '../application/service/Authentication';
import { CreatePaymentRecordUseCase } from '../application/usecase/CreatePaymentRecordUseCase';

export class CreatePaymentRecordController {
    constructor(
        private readonly authentication: Authentication,
        private readonly createPaymentRecordUseCase: CreatePaymentRecordUseCase
    ) {}

    execute(
        input: CreatePaymentRecordRequest
    ): AppsScriptServerResponse<CreatePaymentRecordResponse> {
        const parsedInput = createPaymentRecordRequest.safeParse(input);
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
            throw new UnauthorizedError();
        }

        return new AppsScriptServerResponse(
            this.createPaymentRecordUseCase.execute(userId, parsedInput.data)
        );
    }
}
