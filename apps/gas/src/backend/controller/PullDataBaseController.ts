import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { PullDatabaseInput, PullDatabaseOutput } from '../../shared/api/system';
import { Authentication } from '../application/service/Authentication';
import { PullDataBaseUseCase } from '../application/usecase/PullDataBaseUseCase';

export class PullDataBaseController {
    constructor(
        private readonly authentication: Authentication,
        private readonly pullDataBaseUseCase: PullDataBaseUseCase
    ) {}
    execute(
        input: PullDatabaseInput
    ): AppsScriptServerResponse<PullDatabaseOutput> {
        if (!input.sessionToken) {
            throw new Error('Session token is required');
        }
        const userId = this.authentication.execute(input.sessionToken);
        const allSyncData = this.pullDataBaseUseCase.execute(userId);
        return new AppsScriptServerResponse(allSyncData);
    }
}
