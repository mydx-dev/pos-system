import { describe, expect, it } from 'vitest';
import type {
    PaymentRecordInputRow,
    PaymentRecordRow,
    RegisterTerminalRecord,
    TreatmentRecord,
    UserRecord,
} from '../db/registerPaymentRepository';
import {
    hashRegisterTerminalToken,
    RegisterPaymentService,
    type RegisterPaymentStore,
} from './service';

const pepper = '00000000-0000-4000-8000-000000000000';
const terminalId = '00000000-0000-4000-8000-000000000001';
const treatmentId = '00000000-0000-4000-8000-000000000010';
const paymentRecordId = '00000000-0000-4000-8000-000000000020';
const usedAt = '2026-07-07T09:00:00.000Z';

const env = {
    PASSWORD_PEPPER: pepper,
    DB: null,
} as unknown as Env;

const createTerminal = async (): Promise<RegisterTerminalRecord> => ({
    id: terminalId,
    name: 'Main register',
    token_hash: await hashRegisterTerminalToken(
        'RGT-ABCD-1234-EFGH',
        terminalId,
        pepper
    ),
    enabled: 1,
    issued_at: '2026-07-01T00:00:00.000Z',
    last_used_at: null,
    created_by: '00000000-0000-4000-8000-000000000002',
    updated_by: null,
    version: 1,
});

const treatment: TreatmentRecord = {
    id: treatmentId,
    customer_id: '00000000-0000-4000-8000-000000000030',
    staff_id: '00000000-0000-4000-8000-000000000040',
    status: '来店済み',
    start_at: '2026-07-07T08:00:00.000Z',
    duration: 60,
    note: null,
    version: 1,
};

const createStore = async (
    overrides: Partial<RegisterPaymentStore> = {}
): Promise<RegisterPaymentStore> => {
    const terminal = await createTerminal();

    return {
        listEnabledRegisterTerminals: async () => [terminal],
        markRegisterTerminalUsed: async (_id, lastUsedAt) => ({
            ...terminal,
            last_used_at: lastUsedAt,
        }),
        listCustomers: async () => [],
        listEmployees: async () => [],
        listUsers: async (): Promise<UserRecord[]> => [
            {
                id: '00000000-0000-4000-8000-000000000002',
                name: 'Admin',
                email: 'admin@example.com',
                password: 'secret-hash',
                approval: 1,
                version: 1,
            },
        ],
        listTreatments: async () => [treatment],
        listTreatmentMenus: async () => [],
        listMenus: async () => [],
        listMenuCategories: async () => [],
        listPaymentRecords: async () => [],
        findTreatmentById: async (id) => (id === treatmentId ? treatment : null),
        listPaymentRecordsByTreatmentId: async () => [],
        createPaymentRecord: async (
            paymentRecord: PaymentRecordInputRow,
            shouldMarkTreatmentPaid: boolean
        ) => ({
            paymentRecord: {
                ...paymentRecord,
                version: paymentRecord.version ?? 1,
            },
            treatment: {
                ...treatment,
                status: shouldMarkTreatmentPaid ? '精算済み' : treatment.status,
                version: shouldMarkTreatmentPaid
                    ? treatment.version + 1
                    : treatment.version,
            },
        }),
        ...overrides,
    };
};

const createService = async (overrides: Partial<RegisterPaymentStore> = {}) =>
    new RegisterPaymentService(
        env,
        await createStore(overrides),
        () => usedAt,
        () => paymentRecordId
    );

describe('register terminal token hashing', () => {
    it('matches the GAS PasswordProtection SHA-256 base64 format', async () => {
        const hash = await hashRegisterTerminalToken(
            ' rgt-abcd-1234-efgh ',
            '00000000-0000-4000-8000-000000000001',
            '00000000-0000-4000-8000-000000000000'
        );

        expect(hash).toBe(
            await hashRegisterTerminalToken(
                'RGT-ABCD-1234-EFGH',
                '00000000-0000-4000-8000-000000000001',
                '00000000-0000-4000-8000-000000000000'
            )
        );
        expect(hash).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    });
});

describe('RegisterPaymentService', () => {
    it('logs in an enabled register terminal and returns last used time', async () => {
        const service = await createService();

        await expect(
            service.loginRegisterTerminal({ token: ' rgt-abcd-1234-efgh ' })
        ).resolves.toEqual({
            registerTerminal: {
                ID: terminalId,
                端末名: 'Main register',
                有効: true,
                最終利用日時: usedAt,
            },
        });
    });

    it('pulls register terminal data without exposing user password hashes', async () => {
        const service = await createService();

        const output = await service.pullDatabaseRegisterTerminal(
            'RGT-ABCD-1234-EFGH'
        );

        expect(output.map((entry) => entry.table.name)).toEqual([
            '顧客',
            'スタッフ',
            'ユーザー',
            '施術',
            '施術メニュー',
            'メニュー',
            'メニューカテゴリー',
            '精算履歴',
        ]);
        expect(output[2].records).toEqual([
            {
                ID: '00000000-0000-4000-8000-000000000002',
                氏名: 'Admin',
                メールアドレス: 'admin@example.com',
                パスワード: '',
                承認: true,
                バージョン: 1,
            },
        ]);
    });

    it('creates a paid payment record and marks the treatment paid', async () => {
        const service = await createService();

        await expect(
            service.createPaymentRecord({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
                paymentRecord: {
                    施術ID: treatmentId,
                    種別: '精算',
                    金額: 5000,
                    支払方法: '現金',
                    備考: null,
                    対象精算ID: null,
                },
            })
        ).resolves.toEqual({
            paymentRecord: {
                ID: paymentRecordId,
                施術ID: treatmentId,
                種別: '精算',
                金額: 5000,
                支払方法: '現金',
                発生日時: usedAt,
                備考: null,
                対象精算ID: null,
                バージョン: 1,
            },
            treatment: {
                ID: treatmentId,
                状態: '精算済み',
                バージョン: 2,
            },
            summary: {
                精算合計: 5000,
                取消合計: 0,
                返金合計: 0,
                差引売上: 5000,
            },
        });
    });

    it('rejects cancel records without an existing paid payment record', async () => {
        const service = await createService();

        await expect(
            service.createPaymentRecord({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
                paymentRecord: {
                    施術ID: treatmentId,
                    種別: '取消',
                    金額: 5000,
                    支払方法: '現金',
                    備考: null,
                    対象精算ID: null,
                },
            })
        ).rejects.toThrow('Invalid payment record.');
    });

    it('rejects additional paid records for an already paid treatment', async () => {
        const existingPaidRecord: PaymentRecordRow = {
            id: '00000000-0000-4000-8000-000000000050',
            treatment_id: treatmentId,
            type: '精算',
            amount: 5000,
            payment_method: '現金',
            occurred_at: '2026-07-07T08:30:00.000Z',
            note: null,
            target_payment_record_id: null,
            version: 1,
        };
        const service = await createService({
            findTreatmentById: async () => ({
                ...treatment,
                status: '精算済み',
            }),
            listPaymentRecordsByTreatmentId: async () => [existingPaidRecord],
        });

        await expect(
            service.createPaymentRecord({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
                paymentRecord: {
                    施術ID: treatmentId,
                    種別: '精算',
                    金額: 5000,
                    支払方法: '現金',
                    備考: null,
                    対象精算ID: null,
                },
            })
        ).rejects.toThrow('Invalid payment record.');
    });

    it.each(['取消', '返金'] as const)(
        'rejects %s records without target payment record id',
        async (type) => {
            const existingPaidRecord: PaymentRecordRow = {
                id: '00000000-0000-4000-8000-000000000050',
                treatment_id: treatmentId,
                type: '精算',
                amount: 5000,
                payment_method: '現金',
                occurred_at: '2026-07-07T08:30:00.000Z',
                note: null,
                target_payment_record_id: null,
                version: 1,
            };
            const service = await createService({
                listPaymentRecordsByTreatmentId: async () => [
                    existingPaidRecord,
                ],
            });

            await expect(
                service.createPaymentRecord({
                    registerTerminalToken: 'RGT-ABCD-1234-EFGH',
                    paymentRecord: {
                        施術ID: treatmentId,
                        種別: type,
                        金額: 5000,
                        支払方法: '現金',
                        備考: null,
                        対象精算ID: null,
                    },
                })
            ).rejects.toThrow('Invalid payment record.');
        }
    );

    it('summarizes cancellation against an existing paid payment record', async () => {
        const existingPaidRecord: PaymentRecordRow = {
            id: '00000000-0000-4000-8000-000000000050',
            treatment_id: treatmentId,
            type: '精算',
            amount: 5000,
            payment_method: '現金',
            occurred_at: '2026-07-07T08:30:00.000Z',
            note: null,
            target_payment_record_id: null,
            version: 1,
        };
        const service = await createService({
            listPaymentRecordsByTreatmentId: async () => [existingPaidRecord],
        });

        await expect(
            service.createPaymentRecord({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
                paymentRecord: {
                    施術ID: treatmentId,
                    種別: '取消',
                    金額: 5000,
                    支払方法: '現金',
                    備考: null,
                    対象精算ID: existingPaidRecord.id,
                },
            })
        ).resolves.toMatchObject({
            summary: {
                精算合計: 5000,
                取消合計: 5000,
                返金合計: 0,
                差引売上: 0,
            },
        });
    });
});
