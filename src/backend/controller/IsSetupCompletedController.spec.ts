import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/isSetupCompletedTestContext';

describe('ユースケースの呼び出し', () => {
    it('ユースケースが正常に呼び出される', () => {
        const {
            isSetupCompleted: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockReturnValue(true);
        const response = controller.execute();
        expect(usecaseSpy).toHaveBeenCalled();
        expect(response).toEqual(new AppsScriptServerResponse(true));
    });
});
