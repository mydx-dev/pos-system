import { vi } from 'vitest';
import { createTestContext } from '../helpers/createTestContext';

export function context() {
    const ctx = createTestContext();
    const usecase = ctx.scope.resolve('forgotPasswordUseCase');
    return {
        ...ctx,
        forgotPassword: {
            usecase,
            usecaseSpy: vi.spyOn(usecase, 'execute'),
            controller: ctx.scope.resolve('forgotPasswordController'),
        },
    };
}
