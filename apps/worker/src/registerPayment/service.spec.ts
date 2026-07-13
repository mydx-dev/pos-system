import { describe, expect, it } from 'vitest';
import type {
    CustomerRecord,
    MenuCategoryRecord,
    MenuRecord,
    PaymentRecordInputRow,
    PaymentRecordRow,
    RegisterTreatmentListRecord,
    RegisterTerminalRecord,
    TreatmentMenuRecord,
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
const paidTreatmentId = '00000000-0000-4000-8000-000000000011';
const paymentRecordId = '00000000-0000-4000-8000-000000000020';
const customerId = '00000000-0000-4000-8000-000000000030';
const staffId = '00000000-0000-4000-8000-000000000040';
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
    customer_id: customerId,
    staff_id: staffId,
    status: '来店済み',
    start_at: '2026-07-07T08:00:00.000Z',
    duration: 60,
    note: null,
    version: 1,
};

const customer: CustomerRecord = {
    id: customerId,
    name: '山田 太郎',
    primary_staff_id: staffId,
    is_staff_fixed: 1,
    email: 'customer@example.com',
    phone_number: '09012345678',
    birth_date: '1990-01-01',
    postal_code: '1000001',
    address: '東京都千代田区',
    note: null,
    version: 1,
};

const staff: UserRecord = {
    id: staffId,
    name: '佐藤 花子',
    email: 'staff@example.com',
    password: 'staff-secret-hash',
    approval: 1,
    version: 1,
};

const treatmentMenu: TreatmentMenuRecord = {
    id: '00000000-0000-4000-8000-000000000060',
    treatment_id: treatmentId,
    menu_id: '00000000-0000-4000-8000-000000000070',
    menu_name: 'カット',
    regular_price: 5000,
    quantity: 2,
    discount_amount: 500,
    display_order: 1,
    version: 1,
};

const menuCategory: MenuCategoryRecord = {
    id: '00000000-0000-4000-8000-000000000080',
    name: 'ヘア',
    menu_type: '技術',
    version: 1,
};

const menu: MenuRecord = {
    id: treatmentMenu.menu_id,
    name: 'カット',
    menu_number: 'M-001',
    price: 5000,
    cost_price: 1000,
    tax_type: '内税',
    product_type: '業務用',
    menu_type: '技術',
    category_id: menuCategory.id,
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
            staff,
        ],
        listTreatments: async () => [treatment],
        listRegisterTreatments: async (): Promise<
            RegisterTreatmentListRecord[]
        > => [
            {
                id: treatmentId,
                customer_id: customerId,
                customer_name: customer.name,
                staff_id: staffId,
                staff_name: staff.name,
                status: '来店済み',
                start_at: treatment.start_at,
                total_amount: 9000,
                version: 1,
            },
        ],
        listTreatmentMenus: async () => [],
        listTreatmentMenusByTreatmentId: async (id) =>
            id === treatmentId ? [treatmentMenu] : [],
        listMenus: async () => [menu],
        listMenuCategories: async () => [menuCategory],
        listPaymentRecords: async () => [],
        findTreatmentById: async (id) => (id === treatmentId ? treatment : null),
        findCustomerById: async (id) => (id === customerId ? customer : null),
        findUserById: async (id) => (id === staffId ? staff : null),
        listPaymentRecordsByTreatmentId: async () => [],
        createRegisterTerminalSession: async () => {},
        findActiveRegisterTerminalBySession: async () => null,
        touchRegisterTerminalSession: async () => {},
        deleteRegisterTerminalSession: async () => {},
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

        const response = await service.loginRegisterTerminal({
            token: ' rgt-abcd-1234-efgh ',
        });

        expect(response).toEqual({
            registerTerminal: {
                ID: terminalId,
                端末名: 'Main register',
                有効: true,
                最終利用日時: usedAt,
            },
            sessionToken: expect.any(String),
            sessionExpiresAt: expect.any(Number),
        });
        expect(response.sessionToken.length).toBeGreaterThan(20);
        expect(response.sessionExpiresAt).toBeGreaterThan(Date.now());
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
            {
                ID: staffId,
                氏名: '佐藤 花子',
                メールアドレス: 'staff@example.com',
                パスワード: '',
                承認: true,
                バージョン: 1,
            },
        ]);
    });

    it('lists unpaid register treatments with customer, staff, and total amount', async () => {
        const service = await createService({
            listRegisterTreatments: async () => [
                {
                    id: treatmentId,
                    customer_id: customerId,
                    customer_name: customer.name,
                    staff_id: staffId,
                    staff_name: staff.name,
                    status: '予約済み',
                    start_at: '2026-07-07T08:00:00.000Z',
                    total_amount: 9000,
                    version: 1,
                },
                {
                    id: paidTreatmentId,
                    customer_id: customerId,
                    customer_name: customer.name,
                    staff_id: staffId,
                    staff_name: staff.name,
                    status: '来店済み',
                    start_at: '2026-07-07T09:00:00.000Z',
                    total_amount: 5000,
                    version: 2,
                },
            ],
        });

        await expect(
            service.listRegisterTreatments({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
            })
        ).resolves.toEqual({
            treatments: [
                {
                    ID: treatmentId,
                    顧客ID: customerId,
                    顧客名: '山田 太郎',
                    担当スタッフID: staffId,
                    担当スタッフ名: '佐藤 花子',
                    状態: '予約済み',
                    開始日時: '2026-07-07T08:00:00.000Z',
                    合計金額: 9000,
                    バージョン: 1,
                },
                {
                    ID: paidTreatmentId,
                    顧客ID: customerId,
                    顧客名: '山田 太郎',
                    担当スタッフID: staffId,
                    担当スタッフ名: '佐藤 花子',
                    状態: '来店済み',
                    開始日時: '2026-07-07T09:00:00.000Z',
                    合計金額: 5000,
                    バージョン: 2,
                },
            ],
        });
    });

    it('returns register treatment detail with summary', async () => {
        const existingPaidRecord: PaymentRecordRow = {
            id: '00000000-0000-4000-8000-000000000050',
            treatment_id: treatmentId,
            type: '精算',
            amount: 9000,
            payment_method: '現金',
            occurred_at: '2026-07-07T08:30:00.000Z',
            note: null,
            target_payment_record_id: null,
            version: 1,
        };
        const existingCancelRecord: PaymentRecordRow = {
            id: '00000000-0000-4000-8000-000000000051',
            treatment_id: treatmentId,
            type: '取消',
            amount: 1000,
            payment_method: '現金',
            occurred_at: '2026-07-07T08:45:00.000Z',
            note: '一部取消',
            target_payment_record_id: existingPaidRecord.id,
            version: 1,
        };
        const service = await createService({
            listPaymentRecordsByTreatmentId: async () => [
                existingPaidRecord,
                existingCancelRecord,
            ],
        });

        await expect(
            service.getRegisterTreatmentDetail({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
                treatmentId,
            })
        ).resolves.toEqual({
            treatment: {
                ID: treatmentId,
                顧客ID: customerId,
                担当スタッフID: staffId,
                状態: '来店済み',
                開始日時: '2026-07-07T08:00:00.000Z',
                所要時間: 60,
                備考: null,
                バージョン: 1,
            },
            customer: {
                ID: customerId,
                氏名: '山田 太郎',
                主担当スタッフID: staffId,
                担当固定: true,
                メールアドレス: 'customer@example.com',
                電話番号: '09012345678',
                生年月日: '1990-01-01',
                郵便番号: '1000001',
                住所: '東京都千代田区',
                備考: null,
                バージョン: 1,
            },
            staff: {
                ユーザーID: staffId,
                氏名: '佐藤 花子',
            },
            treatmentMenus: [
                {
                    ID: treatmentMenu.id,
                    施術ID: treatmentId,
                    メニューID: treatmentMenu.menu_id,
                    メニュー名: 'カット',
                    通常価格: 5000,
                    数量: 2,
                    値引き額: 500,
                    表示順: 1,
                    バージョン: 1,
                },
            ],
            paymentRecords: [
                {
                    ID: existingPaidRecord.id,
                    施術ID: treatmentId,
                    種別: '精算',
                    金額: 9000,
                    支払方法: '現金',
                    発生日時: '2026-07-07T08:30:00.000Z',
                    備考: null,
                    対象精算ID: null,
                    バージョン: 1,
                },
                {
                    ID: existingCancelRecord.id,
                    施術ID: treatmentId,
                    種別: '取消',
                    金額: 1000,
                    支払方法: '現金',
                    発生日時: '2026-07-07T08:45:00.000Z',
                    備考: '一部取消',
                    対象精算ID: existingPaidRecord.id,
                    バージョン: 1,
                },
            ],
            summary: {
                精算合計: 9000,
                取消合計: 1000,
                返金合計: 0,
                差引売上: 8000,
            },
        });
    });

    it('rejects missing register treatment detail', async () => {
        const service = await createService();

        await expect(
            service.getRegisterTreatmentDetail({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
                treatmentId: '00000000-0000-4000-8000-000000000099',
            })
        ).rejects.toThrow('Treatment not found.');
    });

    it('lists register menus with categories', async () => {
        const service = await createService();

        await expect(
            service.listRegisterMenus({
                registerTerminalToken: 'RGT-ABCD-1234-EFGH',
            })
        ).resolves.toEqual({
            menuCategories: [
                {
                    ID: menuCategory.id,
                    名称: 'ヘア',
                    種別: '技術',
                    バージョン: 1,
                },
            ],
            menus: [
                {
                    ID: menu.id,
                    名称: 'カット',
                    メニュー番号: 'M-001',
                    価格: 5000,
                    仕入れ単価: 1000,
                    税区分: '内税',
                    商品区分: '業務用',
                    種別: '技術',
                    カテゴリーID: menuCategory.id,
                    バージョン: 1,
                },
            ],
        });
    });

    it('rejects register screen APIs with an invalid terminal token', async () => {
        const service = await createService();

        await expect(
            service.listRegisterTreatments({
                registerTerminalToken: 'RGT-WRONG-0000-TOKEN',
            })
        ).rejects.toThrow('Invalid register terminal token.');
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
