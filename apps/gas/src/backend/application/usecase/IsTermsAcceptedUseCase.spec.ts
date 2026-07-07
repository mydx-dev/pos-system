import { InMemoryProperties } from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { isTermsAcceptedKey } from '../../../shared/config';
import { IsTermsAcceptedUseCase } from './IsTermsAcceptedUseCase';

function factory() {
    const scriptProperties = new InMemoryProperties();
    const usecase = new IsTermsAcceptedUseCase(
        scriptProperties,
        isTermsAcceptedKey
    );
    return usecase;
}

function getDependencies(usecase: IsTermsAcceptedUseCase) {
    const getPropertySpy = vi.spyOn(usecase['properties'], 'getProperty');
    return { getPropertySpy };
}

describe('シーケンス', () => {
    it("スクリプトプロパティから、'TERMS_ACCEPTED'キーの値を取得できること", () => {
        const usecase = factory();
        const { getPropertySpy } = getDependencies(usecase);
        usecase.execute();
        expect(getPropertySpy).toHaveBeenCalledWith('TERMS_ACCEPTED');
    });

    it("スクリプトプロパティから取得した値が'true'の場合、利用規約に同意していると判断すること", () => {
        const usecase = factory();
        const { getPropertySpy } = getDependencies(usecase);
        getPropertySpy.mockReturnValue('true');
        const result = usecase.execute();
        expect(result).toBe(true);
    });

    it("スクリプトプロパティから取得した値が'true'以外の場合、利用規約に同意していないと判断すること", () => {
        const usecase = factory();
        const { getPropertySpy } = getDependencies(usecase);
        getPropertySpy.mockReturnValue('false');
        let result = usecase.execute();
        expect(result).toBe(false);

        getPropertySpy.mockReturnValue(null);
        result = usecase.execute();
        expect(result).toBe(false);

        getPropertySpy.mockReturnValue('randomString');
        result = usecase.execute();
        expect(result).toBe(false);
    });
});
