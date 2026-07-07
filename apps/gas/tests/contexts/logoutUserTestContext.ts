import { vi } from 'vitest';
import { createTestContext } from '../helpers/createTestContext';

export function context() {
    const ctx = createTestContext();
    const usecase = ctx.scope.resolve('logoutUserUseCase');
    return {
        ...ctx,
        logoutUser: {
            usecase,
            usecaseSpy: vi.spyOn(usecase, 'execute'),
            controller: ctx.scope.resolve('logoutUserController'),
        },
    };
}
