import { InMemoryCacheService } from '@mydx-dev/gas-boost-runtime/testing';
import { expect, it, vi } from 'vitest';
import { LogoutUserUseCase } from './LogoutUserUseCase';

it('キャッシュからユーザーIDを削除する', () => {
    const logoutUseCase = new LogoutUserUseCase(
        new InMemoryCacheService().getScriptCache()
    );
    const cacheRemoveSpy = vi.spyOn(logoutUseCase['cache'], 'remove');
    cacheRemoveSpy.mockReturnValueOnce(undefined);
    logoutUseCase.execute('valid-session-token');
    expect(cacheRemoveSpy).toHaveBeenCalledWith('valid-session-token');
});
