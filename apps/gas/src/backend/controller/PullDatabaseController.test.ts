import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/pullDataBaseTestContext';

describe('DB同期コントローラー', () => {
    it('セッショントークンがない場合、エラーを返す', () => {
        const {
            pullDataBase: { controller },
        } = context();
        expect(() => controller.execute({ sessionToken: '' })).toThrow(
            'Session token is required'
        );
    });

    it('認証に失敗した場合、エラーを返す', () => {
        const {
            pullDataBase: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });

        expect(() =>
            controller.execute({ sessionToken: 'invalid_token' })
        ).toThrow('Invalid session token');
    });

    it('ユースケースが正常に呼び出される', () => {
        const {
            pullDataBase: { usecaseSpy, controller },
            authSpy,
        } = context();
        authSpy.mockReturnValue('user-id-123');
        usecaseSpy.mockReturnValue([]);
        controller.execute({ sessionToken: 'valid_token' });

        expect(usecaseSpy).toHaveBeenCalledWith('user-id-123');
    });
});
