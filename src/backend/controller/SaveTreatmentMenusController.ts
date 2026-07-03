import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    SaveTreatmentMenusRequest,
    SaveTreatmentMenusResponse,
    saveTreatmentMenusRequest,
} from '../../shared/api/treatment';
import { Authentication } from '../application/service/Authentication';
import { SaveTreatmentMenusUseCase } from '../application/usecase/SaveTreatmentMenusUseCase';

export class SaveTreatmentMenusController {
    constructor(
        private readonly authentication: Authentication,
        private readonly saveTreatmentMenusUseCase: SaveTreatmentMenusUseCase
    ) {}

    execute(
        input: SaveTreatmentMenusRequest
    ): AppsScriptServerResponse<SaveTreatmentMenusResponse> {
        const parsedInput = saveTreatmentMenusRequest.safeParse(input);
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
            this.saveTreatmentMenusUseCase.execute(userId, parsedInput.data)
        );
    }
}
