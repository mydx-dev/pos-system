import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateTreatmentRequest,
    CreateTreatmentResponse,
    createTreatmentRequest,
} from '../../shared/api/treatment';
import { Authentication } from '../application/service/Authentication';
import { CreateTreatmentUseCase } from '../application/usecase/CreateTreatmentUseCase';

export class CreateTreatmentController {
    constructor(
        private readonly authentication: Authentication,
        private readonly createTreatmentUseCase: CreateTreatmentUseCase
    ) {}

    execute(
        input: CreateTreatmentRequest
    ): AppsScriptServerResponse<CreateTreatmentResponse> {
        const parsedInput = createTreatmentRequest.safeParse(input);
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
            this.createTreatmentUseCase.execute(userId, parsedInput.data)
        );
    }
}
