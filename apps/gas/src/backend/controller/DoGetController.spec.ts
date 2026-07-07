import { describe, expect, it, vi } from 'vitest';
import { context } from '../../../tests/contexts/doGetTestContext';

describe('doGet', () => {
    it('DoGetユースケースを呼び出す', () => {
        const {
            doGet: { usecaseSpy, controller },
        } = context();
        usecaseSpy.mockImplementation(vi.fn());
        controller.execute();
        expect(usecaseSpy).toHaveBeenCalledWith();
    });

    it('HTMLを返す', () => {
        const {
            doGet: { controller },
        } = context();
        const result = controller.execute();
        expect(result).toBeInstanceOf(Object);
    });
});
