import { InMemoryCacheService } from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { Authentication } from './Authentication';

function factory() {
    const cache = new InMemoryCacheService().getScriptCache();
    const authentication = new Authentication(cache);
    return { authentication };
}

function getDependencies(authentication: Authentication) {
    const get = vi.spyOn(authentication['cache'], 'get');
    const put = vi.spyOn(authentication['cache'], 'put');
    return { get, put };
}

describe('セッショントークンによる認証', () => {
    const { authentication } = factory();
    const { get, put } = getDependencies(authentication);

    it('セッショントークンがない場合は認証できない', () => {
        expect(() =>
            authentication.execute(undefined as unknown as string)
        ).toThrow('Session token is required');
    });

    it('キャッシュからセッショントークンを取得できない場合は認証できない', () => {
        get.mockReturnValueOnce(null);
        expect(() => authentication.execute('valid-session-token')).toThrow(
            'Invalid session token'
        );
    });

    it('セッショントークンからユーザーIDを取得できる', () => {
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        get.mockReturnValueOnce(userId);
        const result = authentication.execute('valid-session-token');
        expect(result).toBe(userId);
    });

    it('キャッシュの保存時間を延長する', () => {
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        get.mockReturnValueOnce(userId);
        authentication.execute('valid-session-token');
        expect(put).toHaveBeenCalledWith(
            'valid-session-token',
            userId,
            20 * 60
        );
    });
});
