import { InvalidArgumentError } from '@mydx-dev/gas-boost-runtime/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { context } from '../../../../tests/contexts/createPaymentRecordTestContext';
import { CreatePaymentRecordRequest } from '@mydx-pos/shared/api/paymentRecord';
import {
    PaymentRecordTable,
    TreatmentMenuTable,
    TreatmentTable,
} from '../../infrastructure/database/tables';

const treatmentId = '11111111-1111-4111-8111-111111111111';
const customerId = '22222222-2222-4222-8222-222222222222';
const staffId = '33333333-3333-4333-8333-333333333333';
const cutMenuId = '44444444-4444-4444-8444-444444444444';
const colorMenuId = '55555555-5555-4555-8555-555555555555';
const paymentRecordId = '66666666-6666-4666-8666-666666666666';

function correctInput(): Pick<CreatePaymentRecordRequest, 'paymentRecord'> {
    return {
        paymentRecord: {
            施術ID: treatmentId,
            種別: '精算',
            金額: 20500,
            支払方法: '現金',
            備考: '現金精算',
        },
    };
}

function seedTreatment(dataStore: ReturnType<typeof context>['dataStore']) {
    dataStore.set(`${TreatmentTable.dbId}:${TreatmentTable.name}`, [
        Object.keys(TreatmentTable.schema.def.shape),
        [
            treatmentId,
            customerId,
            staffId,
            '来店済み',
            '2026-07-02T10:00:00.000Z',
            120,
            null,
            1,
        ],
    ]);
    dataStore.set(`${TreatmentMenuTable.dbId}:${TreatmentMenuTable.name}`, [
        Object.keys(TreatmentMenuTable.schema.def.shape),
        [
            '77777777-7777-4777-8777-777777777777',
            treatmentId,
            cutMenuId,
            'カット',
            5000,
            1,
            500,
            1,
            1,
        ],
        [
            '88888888-8888-4888-8888-888888888888',
            treatmentId,
            colorMenuId,
            'カラー',
            8000,
            2,
            0,
            2,
            1,
        ],
    ]);
    dataStore.set(`${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`, [
        Object.keys(PaymentRecordTable.schema.def.shape),
    ]);
}

function seedPaidTreatment(
    dataStore: ReturnType<typeof context>['dataStore'],
    extraRecords: unknown[][] = []
) {
    seedTreatment(dataStore);
    dataStore.set(`${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`, [
        Object.keys(PaymentRecordTable.schema.def.shape),
        [
            paymentRecordId,
            treatmentId,
            '精算',
            20500,
            '現金',
            '2026-07-02T10:00:00.000Z',
            null,
            null,
            1,
        ],
        ...extraRecords,
    ]);
}

beforeEach(() => {
    vi.setSystemTime(new Date('2026-07-02T12:00:00.000Z'));
});

describe('バリデーション', () => {
    it('存在しない施術IDの場合はエラー', () => {
        const {
            createPaymentRecord: { usecase },
        } = context();

        expect(() => usecase.execute(correctInput())).toThrow(
            InvalidArgumentError
        );
    });

    it('精算金額が施術合計と一致しない場合でも精算履歴を登録できる', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
        } = context();
        seedTreatment(dataStore);
        const input = correctInput();
        input.paymentRecord.金額 = 20499;

        const result = usecase.execute(input);

        expect(result.paymentRecord.金額).toBe(20499);
        expect(result.summary).toEqual({
            精算合計: 20499,
            取消合計: 0,
            返金合計: 0,
            差引売上: 20499,
        });
    });

    it('差引売上が残っている施術でも再精算できる', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
        } = context();
        seedPaidTreatment(dataStore);

        const result = usecase.execute(correctInput());

        expect(result.summary).toEqual({
            精算合計: 41000,
            取消合計: 0,
            返金合計: 0,
            差引売上: 41000,
        });
    });
});

describe('精算履歴作成', () => {
    it('精算履歴を登録し、施術状態を精算済みに更新できる', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
            getUuidSpy,
        } = context();
        seedTreatment(dataStore);

        const result = usecase.execute(correctInput());
        const savedPaymentRecordId = getUuidSpy.mock.results[0].value;

        expect(result).toEqual({
            paymentRecord: {
                ID: savedPaymentRecordId,
                施術ID: treatmentId,
                種別: '精算',
                金額: 20500,
                支払方法: '現金',
                発生日時: '2026-07-02T12:00:00.000Z',
                備考: '現金精算',
                対象精算ID: undefined,
                バージョン: 1,
            },
            treatment: {
                ID: treatmentId,
                状態: '精算済み',
                バージョン: 2,
            },
            summary: {
                精算合計: 20500,
                取消合計: 0,
                返金合計: 0,
                差引売上: 20500,
            },
        });
        expect(
            dataStore.get(
                `${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`
            ).headers
        ).toEqual(Object.keys(PaymentRecordTable.schema.def.shape));
        expect(
            dataStore.get(
                `${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`
            ).rows
        ).toEqual([
            [
                savedPaymentRecordId,
                treatmentId,
                '精算',
                20500,
                '現金',
                '2026-07-02T12:00:00.000Z',
                '現金精算',
                undefined,
                1,
            ],
        ]);
        expect(
            dataStore.get(`${TreatmentTable.dbId}:${TreatmentTable.name}`)
                .headers
        ).toEqual(Object.keys(TreatmentTable.schema.def.shape));
        expect(
            dataStore.get(`${TreatmentTable.dbId}:${TreatmentTable.name}`).rows
        ).toEqual([
            [
                treatmentId,
                customerId,
                staffId,
                '精算済み',
                '2026-07-02T10:00:00.000Z',
                120,
                null,
                2,
            ],
        ]);
    });

    it('取消履歴を登録できる', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
        } = context();
        seedPaidTreatment(dataStore);

        const result = usecase.execute({
            paymentRecord: {
                施術ID: treatmentId,
                種別: '取消',
                金額: 20500,
                支払方法: '現金',
                備考: '誤精算',
                対象精算ID: paymentRecordId,
            },
        });

        expect(result.summary).toEqual({
            精算合計: 20500,
            取消合計: 20500,
            返金合計: 0,
            差引売上: 0,
        });
        expect(result.paymentRecord.種別).toBe('取消');
        expect(result.paymentRecord.対象精算ID).toBe(paymentRecordId);
        expect(
            dataStore.get(
                `${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`
            ).headers
        ).toEqual(Object.keys(PaymentRecordTable.schema.def.shape));
        expect(
            dataStore.get(
                `${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`
            ).rows
        ).toEqual([
            [
                paymentRecordId,
                treatmentId,
                '精算',
                20500,
                '現金',
                '2026-07-02T10:00:00.000Z',
                null,
                null,
                1,
            ],
            [
                result.paymentRecord.ID,
                treatmentId,
                '取消',
                20500,
                '現金',
                '2026-07-02T12:00:00.000Z',
                '誤精算',
                paymentRecordId,
                1,
            ],
        ]);
        expect(
            dataStore.get(`${TreatmentTable.dbId}:${TreatmentTable.name}`)
                .headers
        ).toEqual(Object.keys(TreatmentTable.schema.def.shape));
        expect(
            dataStore.get(`${TreatmentTable.dbId}:${TreatmentTable.name}`).rows
        ).toEqual([
            [
                treatmentId,
                customerId,
                staffId,
                '来店済み',
                '2026-07-02T10:00:00.000Z',
                120,
                null,
                1,
            ],
        ]);
    });

    it('返金履歴を登録できる', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
        } = context();
        seedPaidTreatment(dataStore);

        const result = usecase.execute({
            paymentRecord: {
                施術ID: treatmentId,
                種別: '返金',
                金額: 3000,
                支払方法: '現金',
                備考: '一部返金',
                対象精算ID: paymentRecordId,
            },
        });

        expect(result.summary).toEqual({
            精算合計: 20500,
            取消合計: 0,
            返金合計: 3000,
            差引売上: 17500,
        });
        expect(result.paymentRecord.種別).toBe('返金');
        expect(
            dataStore.get(
                `${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`
            ).headers
        ).toEqual(Object.keys(PaymentRecordTable.schema.def.shape));
        expect(
            dataStore.get(
                `${PaymentRecordTable.dbId}:${PaymentRecordTable.name}`
            ).rows
        ).toEqual([
            [
                paymentRecordId,
                treatmentId,
                '精算',
                20500,
                '現金',
                '2026-07-02T10:00:00.000Z',
                null,
                null,
                1,
            ],
            [
                result.paymentRecord.ID,
                treatmentId,
                '返金',
                3000,
                '現金',
                '2026-07-02T12:00:00.000Z',
                '一部返金',
                paymentRecordId,
                1,
            ],
        ]);
        expect(
            dataStore.get(`${TreatmentTable.dbId}:${TreatmentTable.name}`)
                .headers
        ).toEqual(Object.keys(TreatmentTable.schema.def.shape));
        expect(
            dataStore.get(`${TreatmentTable.dbId}:${TreatmentTable.name}`).rows
        ).toEqual([
            [
                treatmentId,
                customerId,
                staffId,
                '来店済み',
                '2026-07-02T10:00:00.000Z',
                120,
                null,
                1,
            ],
        ]);
    });

    it('精算履歴がない施術には取消を登録できない', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
        } = context();
        seedTreatment(dataStore);

        expect(() =>
            usecase.execute({
                paymentRecord: {
                    施術ID: treatmentId,
                    種別: '取消',
                    金額: 1000,
                    支払方法: '現金',
                },
            })
        ).toThrow(InvalidArgumentError);
    });

    it('精算履歴がない施術には返金を登録できない', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
        } = context();
        seedTreatment(dataStore);

        expect(() =>
            usecase.execute({
                paymentRecord: {
                    施術ID: treatmentId,
                    種別: '返金',
                    金額: 1000,
                    支払方法: '現金',
                },
            })
        ).toThrow(InvalidArgumentError);
    });

    it('対象精算IDが同一施術の精算履歴でない場合はエラー', () => {
        const {
            createPaymentRecord: { usecase },
            dataStore,
        } = context();
        seedPaidTreatment(dataStore);

        expect(() =>
            usecase.execute({
                paymentRecord: {
                    施術ID: treatmentId,
                    種別: '返金',
                    金額: 1000,
                    支払方法: '現金',
                    対象精算ID: '99999999-9999-4999-8999-999999999999',
                },
            })
        ).toThrow(InvalidArgumentError);
    });
});
