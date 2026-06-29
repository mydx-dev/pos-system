import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/isTermsAcceptedTestContext';

describe('ユースケースの呼び出し', () => {
    it('正常にユースケースが呼び出される', () => {
        const {
            isTermsAccepted: { usecaseSpy, controller },
        } = context();
        usecaseSpy.mockReturnValue(true);
        const result = controller.execute();
        expect(usecaseSpy).toHaveBeenCalled();
        expect(result).toEqual(new AppsScriptServerResponse(true));
    });
});
