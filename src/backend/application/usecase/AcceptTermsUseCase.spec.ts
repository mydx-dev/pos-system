import { describe, expect, it, vi } from 'vitest';
import { context } from '../../../../tests/contexts/acceptTermsTestContext';
import { isTermsAcceptedKey } from '../../../shared/config';

describe('利用規約の同意', () => {
    it("スクリプトプロパティの'TERMS_ACCEPTED'をtrueに設定する", () => {
        const {
            properties,
            acceptTerms: { usecase },
        } = context();
        const setPropertySpy = vi.spyOn(properties, 'setProperty');
        usecase.execute();
        expect(setPropertySpy).toHaveBeenCalledWith(isTermsAcceptedKey, 'true');
    });
});
