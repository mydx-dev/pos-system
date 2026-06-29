import { InMemoryProperties } from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { isSetupCompletedKey } from '../../../shared/config';
import { IsSetupCompletedUseCase } from './IsSetupCompletedUseCase';

function fuctory() {
    const properties = new InMemoryProperties();
    const usecase = new IsSetupCompletedUseCase(
        properties,
        isSetupCompletedKey
    );
    return usecase;
}

function getDependencies(usecase: IsSetupCompletedUseCase) {
    const findSpy = vi.spyOn(usecase['properties'], 'getProperty');
    return { findSpy };
}

describe('シーケンス', () => {
    it("スクリプトプロパティから、'SETUP_COMPLETED'キーの値を取得できること", () => {
        const usecase = fuctory();
        const { findSpy } = getDependencies(usecase);
        usecase.execute();
        expect(findSpy).toHaveBeenCalledWith(isSetupCompletedKey);
    });

    it("スクリプトプロパティから取得した値が'true'の場合、初期設定が完了していると判断すること", () => {
        const usecase = fuctory();
        const { findSpy } = getDependencies(usecase);
        findSpy.mockReturnValue('true');
        const result = usecase.execute();
        expect(result).toBe(true);
    });

    it("スクリプトプロパティから取得した値が'true'以外の場合、初期設定が完了していないと判断すること", () => {
        const usecase = fuctory();
        const { findSpy } = getDependencies(usecase);
        findSpy.mockReturnValue('false');
        let result = usecase.execute();
        expect(result).toBe(false);

        findSpy.mockReturnValue(null);
        result = usecase.execute();
        expect(result).toBe(false);

        findSpy.mockReturnValue('randomString');
        result = usecase.execute();
        expect(result).toBe(false);
    });
});
