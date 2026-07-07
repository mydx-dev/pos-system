import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { context } from '../../../tests/contexts/createUserTestContext';

describe('createUser', () => {
    it('ユーザーの名前がない場合、ユーザーを作成できない', () => {
        const {
            createUser: { controller },
        } = context();
        expect(() =>
            controller.execute({
                name: undefined as never,
                email: 'test@example.com',
                password: 'Password123!',
            })
        ).toThrow(ZodError);
    });

    it('ユーザーのメールアドレスがない場合、ユーザーを作成できない', () => {
        const {
            createUser: { controller },
        } = context();
        expect(() =>
            controller.execute({
                name: 'Test User',
                email: undefined as never,
                password: 'Password123!',
            })
        ).toThrow(ZodError);
    });

    it('ユーザーのパスワードがない場合、ユーザーを作成できない', () => {
        const {
            createUser: { controller },
        } = context();
        expect(() =>
            controller.execute({
                name: 'Test User',
                email: 'test@example.com',
                password: undefined as never,
            })
        ).toThrow(ZodError);
    });

    it('ユーザー作成処理が正常に呼び出される', () => {
        const {
            createUser: { usecaseSpy, controller },
        } = context();
        usecaseSpy.mockReturnValue({
            id: '123e4567-e89b-42d3-a456-426614174000',
            name: 'Test User',
            email: 'test@example.com',
        });
        controller.execute({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123!',
        });

        expect(usecaseSpy).toHaveBeenCalledWith({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123!',
        });
    });
});
