import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/acceptTermsTestContext';

describe('ユースケースの呼び出し', () => {
    it('正常にユースケースが呼び出される', () => {
        const {
            acceptTerms: { usecaseSpy, controller },
        } = context();
        usecaseSpy.mockReturnValue(true);
        const result = controller.execute();
        expect(result).toEqual(new AppsScriptServerResponse(true));
        expect(usecaseSpy).toHaveBeenCalled();
    });
});
