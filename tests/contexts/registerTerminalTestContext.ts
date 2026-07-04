import { vi } from 'vitest';
import { createTestContext } from '../helpers/createTestContext';

export function context() {
    const ctx = createTestContext();
    const createRegisterTerminalUseCase = ctx.scope.resolve(
        'createRegisterTerminalUseCase'
    );
    const refreshRegisterTerminalTokenUseCase = ctx.scope.resolve(
        'refreshRegisterTerminalTokenUseCase'
    );
    const loginRegisterTerminalUseCase = ctx.scope.resolve(
        'loginRegisterTerminalUseCase'
    );

    return {
        ...ctx,
        passwordProtection: ctx.scope.resolve('passwordProtection'),
        createRegisterTerminal: {
            usecase: createRegisterTerminalUseCase,
            usecaseSpy: vi.spyOn(createRegisterTerminalUseCase, 'execute'),
            controller: ctx.scope.resolve('createRegisterTerminalController'),
        },
        refreshRegisterTerminalToken: {
            usecase: refreshRegisterTerminalTokenUseCase,
            usecaseSpy: vi.spyOn(
                refreshRegisterTerminalTokenUseCase,
                'execute'
            ),
            controller: ctx.scope.resolve(
                'refreshRegisterTerminalTokenController'
            ),
        },
        loginRegisterTerminal: {
            usecase: loginRegisterTerminalUseCase,
            usecaseSpy: vi.spyOn(loginRegisterTerminalUseCase, 'execute'),
            controller: ctx.scope.resolve('loginRegisterTerminalController'),
        },
    };
}
