import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreatePaymentRecordRequest,
    CreatePaymentRecordResponse,
    createPaymentRecordRequest,
} from '@mydx-pos/shared/api/paymentRecord';
import { RegisterTerminalAuthentication } from '../application/service/RegisterTerminalAuthentication';
import { CreatePaymentRecordUseCase } from '../application/usecase/CreatePaymentRecordUseCase';

export class CreatePaymentRecordController {
    constructor(
        private readonly registerTerminalAuthentication: RegisterTerminalAuthentication,
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

        try {
            this.registerTerminalAuthentication.execute(
                parsedInput.data.registerTerminalToken
            );
        } catch {
            throw new UnauthorizedError();
        }

        return new AppsScriptServerResponse(
            this.createPaymentRecordUseCase.execute(parsedInput.data)
        );
    }
}
