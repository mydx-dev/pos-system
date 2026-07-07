import type {
    CreatePaymentRecordRequest,
    CreatePaymentRecordResponse,
    PaymentSummary,
} from '@mydx-pos/shared/api/paymentRecord';
import type {
    LoginRegisterTerminalRequest,
    LoginRegisterTerminalResponse,
} from '@mydx-pos/shared/api/registerTerminal';
import type {
    GetRegisterTreatmentDetailRequest,
    GetRegisterTreatmentDetailResponse,
    ListRegisterMenusRequest,
    ListRegisterMenusResponse,
    ListRegisterTreatmentsRequest,
    ListRegisterTreatmentsResponse,
} from '@mydx-pos/shared/api/register';
import type { PullDatabaseRegisterTerminalOutput } from '@mydx-pos/shared/api/system';
import {
    RegisterPaymentRepository,
    type CustomerRecord,
    type EmployeeRecord,
    type MenuCategoryRecord,
    type MenuRecord,
    type PaymentRecordInputRow,
    type PaymentRecordRow,
    type RegisterTreatmentListRecord,
    type RegisterTerminalRecord,
    type TreatmentMenuRecord,
    type TreatmentRecord,
    type UserRecord,
} from '../db/registerPaymentRepository';
import { AuthApiError } from '../auth/service';
import { hashToken, randomId, randomToken, sha256Base64 } from '../auth/crypto';

const REGISTER_TERMINAL_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type RegisterPaymentStore = {
    listEnabledRegisterTerminals: RegisterPaymentRepository['listEnabledRegisterTerminals'];
    markRegisterTerminalUsed: RegisterPaymentRepository['markRegisterTerminalUsed'];
    listCustomers: RegisterPaymentRepository['listCustomers'];
    listEmployees: RegisterPaymentRepository['listEmployees'];
    listUsers: RegisterPaymentRepository['listUsers'];
    listTreatments: RegisterPaymentRepository['listTreatments'];
    listRegisterTreatments: RegisterPaymentRepository['listRegisterTreatments'];
    listTreatmentMenus: RegisterPaymentRepository['listTreatmentMenus'];
    listTreatmentMenusByTreatmentId: RegisterPaymentRepository['listTreatmentMenusByTreatmentId'];
    listMenus: RegisterPaymentRepository['listMenus'];
    listMenuCategories: RegisterPaymentRepository['listMenuCategories'];
    listPaymentRecords: RegisterPaymentRepository['listPaymentRecords'];
    findTreatmentById: RegisterPaymentRepository['findTreatmentById'];
    findCustomerById: RegisterPaymentRepository['findCustomerById'];
    findUserById: RegisterPaymentRepository['findUserById'];
    listPaymentRecordsByTreatmentId: RegisterPaymentRepository['listPaymentRecordsByTreatmentId'];
    createPaymentRecord: RegisterPaymentRepository['createPaymentRecord'];
    createRegisterTerminalSession: RegisterPaymentRepository['createRegisterTerminalSession'];
    findActiveRegisterTerminalBySession: RegisterPaymentRepository['findActiveRegisterTerminalBySession'];
    touchRegisterTerminalSession: RegisterPaymentRepository['touchRegisterTerminalSession'];
    deleteRegisterTerminalSession: RegisterPaymentRepository['deleteRegisterTerminalSession'];
};

type RegisterTerminalAuthInput = {
    registerTerminalToken?: string | null;
    registerTerminalSessionToken?: string | null;
};

type RegisterTerminalSessionRequest<
    T extends { registerTerminalToken: string },
> = Omit<T, 'registerTerminalToken'> & RegisterTerminalAuthInput;

const requirePasswordPepper = (env: Env) => {
    const pepper = env.PASSWORD_PEPPER;
    if (!pepper) {
        throw new AuthApiError(
            'bad_request',
            'PASSWORD_PEPPER is not configured.'
        );
    }
    return pepper;
};

const normalizeRegisterTerminalToken = (token: string) =>
    token.trim().toUpperCase();

export const hashRegisterTerminalToken = (
    plainToken: string,
    terminalId: string,
    pepper: string
) =>
    sha256Base64(
        `${normalizeRegisterTerminalToken(plainToken)}${terminalId}${pepper}`
    );

const timingSafeEqual = (a: string, b: string) => {
    const encoder = new TextEncoder();
    const aBytes = encoder.encode(a);
    const bBytes = encoder.encode(b);
    const length = Math.max(aBytes.length, bBytes.length);
    let diff = aBytes.length ^ bBytes.length;

    for (let index = 0; index < length; index += 1) {
        diff |= (aBytes[index] ?? 0) ^ (bBytes[index] ?? 0);
    }

    return diff === 0;
};

const booleanFromInteger = (value: number) => value === 1;

const registerTerminalResponse = (
    terminal: RegisterTerminalRecord,
    usedAt: string
): LoginRegisterTerminalResponse['registerTerminal'] => ({
    ID: terminal.id,
    端末名: terminal.name,
    有効: booleanFromInteger(terminal.enabled),
    最終利用日時: usedAt,
});

const customerRecord = (record: CustomerRecord) => ({
    ID: record.id,
    氏名: record.name,
    主担当スタッフID: record.primary_staff_id,
    担当固定: booleanFromInteger(record.is_staff_fixed),
    メールアドレス: record.email,
    電話番号: record.phone_number,
    生年月日: record.birth_date,
    郵便番号: record.postal_code,
    住所: record.address,
    備考: record.note,
    バージョン: record.version,
});

const employeeRecord = (record: EmployeeRecord) => ({
    ユーザーID: record.user_id,
});

const userRecord = (record: UserRecord) => ({
    ID: record.id,
    氏名: record.name,
    メールアドレス: record.email,
    パスワード: '',
    承認: booleanFromInteger(record.approval),
    バージョン: record.version,
});

const treatmentRecord = (record: TreatmentRecord) => ({
    ID: record.id,
    顧客ID: record.customer_id,
    担当スタッフID: record.staff_id,
    状態: record.status,
    開始日時: record.start_at,
    所要時間: record.duration,
    備考: record.note,
    バージョン: record.version,
});

const treatmentMenuRecord = (record: TreatmentMenuRecord) => ({
    ID: record.id,
    施術ID: record.treatment_id,
    メニューID: record.menu_id,
    メニュー名: record.menu_name,
    通常価格: record.regular_price,
    数量: record.quantity,
    値引き額: record.discount_amount,
    表示順: record.display_order,
    バージョン: record.version,
});

const menuRecord = (record: MenuRecord) => ({
    ID: record.id,
    名称: record.name,
    メニュー番号: record.menu_number,
    価格: record.price,
    仕入れ単価: record.cost_price,
    税区分: record.tax_type,
    商品区分: record.product_type,
    種別: record.menu_type,
    カテゴリーID: record.category_id,
    バージョン: record.version,
});

const menuCategoryRecord = (record: MenuCategoryRecord) => ({
    ID: record.id,
    名称: record.name,
    種別: record.menu_type,
    バージョン: record.version,
});

const paymentRecord = (record: PaymentRecordRow) => ({
    ID: record.id,
    施術ID: record.treatment_id,
    種別: record.type,
    金額: record.amount,
    支払方法: record.payment_method,
    発生日時: record.occurred_at,
    備考: record.note,
    対象精算ID: record.target_payment_record_id,
    バージョン: record.version,
});

const registerTreatmentListRecord = (
    record: RegisterTreatmentListRecord
): ListRegisterTreatmentsResponse['treatments'][number] => ({
    ID: record.id,
    顧客ID: record.customer_id,
    顧客名: record.customer_name,
    担当スタッフID: record.staff_id,
    担当スタッフ名: record.staff_name,
    状態: record.status,
    開始日時: record.start_at,
    合計金額: record.total_amount,
    バージョン: record.version,
});

const calculateSummary = (records: PaymentRecordRow[]): PaymentSummary => {
    const summary = records.reduce(
        (totals, record) => {
            if (record.type === '精算') {
                totals.精算合計 += record.amount;
            }
            if (record.type === '取消') {
                totals.取消合計 += record.amount;
            }
            if (record.type === '返金') {
                totals.返金合計 += record.amount;
            }
            return totals;
        },
        {
            精算合計: 0,
            取消合計: 0,
            返金合計: 0,
            差引売上: 0,
        }
    );

    return {
        ...summary,
        差引売上: summary.精算合計 - summary.取消合計 - summary.返金合計,
    };
};

const hasPaidPaymentRecord = (records: PaymentRecordRow[]) =>
    records.some((record) => record.type === '精算');

const canUseTargetPaymentRecord = (
    targetPaymentRecordId: string | null | undefined,
    records: PaymentRecordRow[]
) => {
    if (!targetPaymentRecordId) {
        return false;
    }

    return records.some(
        (record) => record.id === targetPaymentRecordId && record.type === '精算'
    );
};

const canCreatePaymentRecord = (
    input: CreatePaymentRecordRequest['paymentRecord'],
    treatment: TreatmentRecord,
    existingRecords: PaymentRecordRow[]
) => {
    if (input.種別 === '精算') {
        return (
            input.金額 > 0 &&
            treatment.status !== '精算済み' &&
            !hasPaidPaymentRecord(existingRecords)
        );
    }

    if (!canUseTargetPaymentRecord(input.対象精算ID, existingRecords)) {
        return false;
    }

    if (input.種別 === '取消') {
        return input.金額 > 0 && hasPaidPaymentRecord(existingRecords);
    }

    if (input.種別 === '返金') {
        return input.金額 > 0 && hasPaidPaymentRecord(existingRecords);
    }

    return false;
};

export class RegisterPaymentService {
    private readonly repository: RegisterPaymentStore;

    constructor(
        private readonly env: Env,
        repository?: RegisterPaymentStore,
        private readonly now = () => new Date().toISOString(),
        private readonly createId = randomId
    ) {
        this.repository = repository ?? new RegisterPaymentRepository(env.DB);
    }

    private async authenticateRegisterTerminal(token: string) {
        const pepper = requirePasswordPepper(this.env);
        const terminals = await this.repository.listEnabledRegisterTerminals();
        const normalizedToken = normalizeRegisterTerminalToken(token);

        for (const terminal of terminals) {
            const tokenHash = await hashRegisterTerminalToken(
                normalizedToken,
                terminal.id,
                pepper
            );
            if (timingSafeEqual(tokenHash, terminal.token_hash)) {
                const usedAt = this.now();
                const savedTerminal =
                    await this.repository.markRegisterTerminalUsed(
                        terminal.id,
                        usedAt
                    );

                if (!savedTerminal) {
                    throw new AuthApiError(
                        'unauthorized',
                        'Invalid register terminal token.'
                    );
                }

                return {
                    terminal: savedTerminal,
                    usedAt,
                };
            }
        }

        throw new AuthApiError(
            'unauthorized',
            'Invalid register terminal token.'
        );
    }

    private async authenticateRegisterTerminalSession(sessionToken: string) {
        const tokenHash = await hashToken(sessionToken);
        const terminal =
            await this.repository.findActiveRegisterTerminalBySession(
                tokenHash,
                Date.now()
            );

        if (!terminal) {
            throw new AuthApiError(
                'unauthorized',
                'Invalid register terminal session.'
            );
        }

        await this.repository.touchRegisterTerminalSession(tokenHash, this.now());
        return terminal;
    }

    private async authenticateRegisterTerminalRequest({
        registerTerminalSessionToken,
        registerTerminalToken,
    }: RegisterTerminalAuthInput) {
        if (registerTerminalSessionToken) {
            return this.authenticateRegisterTerminalSession(
                registerTerminalSessionToken
            );
        }

        if (registerTerminalToken) {
            return (await this.authenticateRegisterTerminal(registerTerminalToken))
                .terminal;
        }

        throw new AuthApiError(
            'unauthorized',
            'Register terminal session is required.'
        );
    }

    async loginRegisterTerminal({ token }: LoginRegisterTerminalRequest): Promise<
        LoginRegisterTerminalResponse & {
            sessionToken: string;
            sessionExpiresAt: number;
        }
    > {
        const { terminal, usedAt } = await this.authenticateRegisterTerminal(token);
        const sessionToken = randomToken();
        const sessionExpiresAt = Date.now() + REGISTER_TERMINAL_SESSION_TTL_MS;
        await this.repository.createRegisterTerminalSession(
            await hashToken(sessionToken),
            terminal.id,
            sessionExpiresAt,
            usedAt
        );

        return {
            registerTerminal: registerTerminalResponse(terminal, usedAt),
            sessionToken,
            sessionExpiresAt,
        };
    }

    async logoutRegisterTerminal(sessionToken: string | null | undefined) {
        if (sessionToken) {
            await this.repository.deleteRegisterTerminalSession(
                await hashToken(sessionToken)
            );
        }

        return { ok: true as const };
    }

    async pullDatabaseRegisterTerminal(
        registerTerminalToken: string
    ): Promise<PullDatabaseRegisterTerminalOutput> {
        // Legacy compatibility API for the GAS / Spreadsheet-era register sync model.
        // New register screen implementations should use purpose-specific register APIs.
        await this.authenticateRegisterTerminal(registerTerminalToken);

        const [
            customers,
            employees,
            users,
            treatments,
            treatmentMenus,
            menus,
            menuCategories,
            paymentRecords,
        ] = await Promise.all([
            this.repository.listCustomers(),
            this.repository.listEmployees(),
            this.repository.listUsers(),
            this.repository.listTreatments(),
            this.repository.listTreatmentMenus(),
            this.repository.listMenus(),
            this.repository.listMenuCategories(),
            this.repository.listPaymentRecords(),
        ]);

        return [
            {
                table: { name: '顧客', primaryKey: 'ID' },
                records: customers.map(customerRecord),
            },
            {
                table: { name: 'スタッフ', primaryKey: 'ユーザーID' },
                records: employees.map(employeeRecord),
            },
            {
                table: { name: 'ユーザー', primaryKey: 'ID' },
                records: users.map(userRecord),
            },
            {
                table: { name: '施術', primaryKey: 'ID' },
                records: treatments.map(treatmentRecord),
            },
            {
                table: { name: '施術メニュー', primaryKey: 'ID' },
                records: treatmentMenus.map(treatmentMenuRecord),
            },
            {
                table: { name: 'メニュー', primaryKey: 'ID' },
                records: menus.map(menuRecord),
            },
            {
                table: { name: 'メニューカテゴリー', primaryKey: 'ID' },
                records: menuCategories.map(menuCategoryRecord),
            },
            {
                table: { name: '精算履歴', primaryKey: 'ID' },
                records: paymentRecords.map(paymentRecord),
            },
        ];
    }

    async listRegisterTreatments(
        input: RegisterTerminalSessionRequest<ListRegisterTreatmentsRequest>
    ): Promise<ListRegisterTreatmentsResponse> {
        await this.authenticateRegisterTerminalRequest(input);

        const treatments = await this.repository.listRegisterTreatments();

        return {
            treatments: treatments.map(registerTreatmentListRecord),
        };
    }

    async getRegisterTreatmentDetail({
        treatmentId,
        ...authInput
    }: RegisterTerminalSessionRequest<GetRegisterTreatmentDetailRequest>): Promise<GetRegisterTreatmentDetailResponse> {
        await this.authenticateRegisterTerminalRequest(authInput);

        const treatment = await this.repository.findTreatmentById(treatmentId);
        if (!treatment) {
            throw new AuthApiError('validation_error', 'Treatment not found.');
        }

        const [customer, staff, treatmentMenus, paymentRecords] =
            await Promise.all([
                this.repository.findCustomerById(treatment.customer_id),
                this.repository.findUserById(treatment.staff_id),
                this.repository.listTreatmentMenusByTreatmentId(treatment.id),
                this.repository.listPaymentRecordsByTreatmentId(treatment.id),
            ]);

        if (!customer || !staff) {
            throw new AuthApiError('validation_error', 'Treatment not found.');
        }

        return {
            treatment: treatmentRecord(treatment),
            customer: customerRecord(customer),
            staff: {
                ユーザーID: staff.id,
                氏名: staff.name,
            },
            treatmentMenus: treatmentMenus.map(treatmentMenuRecord),
            paymentRecords: paymentRecords.map(paymentRecord),
            summary: calculateSummary(paymentRecords),
        };
    }

    async listRegisterMenus(
        input: RegisterTerminalSessionRequest<ListRegisterMenusRequest>
    ): Promise<ListRegisterMenusResponse> {
        await this.authenticateRegisterTerminalRequest(input);

        const [menuCategories, menus] = await Promise.all([
            this.repository.listMenuCategories(),
            this.repository.listMenus(),
        ]);

        return {
            menuCategories: menuCategories.map(menuCategoryRecord),
            menus: menus.map(menuRecord),
        };
    }

    async createPaymentRecord(
        input: RegisterTerminalSessionRequest<CreatePaymentRecordRequest>
    ): Promise<CreatePaymentRecordResponse> {
        await this.authenticateRegisterTerminalRequest(input);

        const treatment = await this.repository.findTreatmentById(
            input.paymentRecord.施術ID
        );
        if (!treatment) {
            throw new AuthApiError('validation_error', 'Treatment not found.');
        }

        const existingRecords =
            await this.repository.listPaymentRecordsByTreatmentId(treatment.id);
        if (
            !canCreatePaymentRecord(
                input.paymentRecord,
                treatment,
                existingRecords
            )
        ) {
            throw new AuthApiError(
                'validation_error',
                'Invalid payment record.'
            );
        }

        const paymentRecordInput: PaymentRecordInputRow = {
            id: this.createId(),
            treatment_id: input.paymentRecord.施術ID,
            type: input.paymentRecord.種別,
            amount: input.paymentRecord.金額,
            payment_method: input.paymentRecord.支払方法,
            occurred_at: this.now(),
            note: input.paymentRecord.備考 ?? null,
            target_payment_record_id: input.paymentRecord.対象精算ID ?? null,
            version: 1,
        };
        const shouldMarkTreatmentPaid =
            paymentRecordInput.type === '精算' && treatment.status !== '精算済み';
        const saved = await this.repository.createPaymentRecord(
            paymentRecordInput,
            shouldMarkTreatmentPaid
        );
        const updatedRecords = [...existingRecords, saved.paymentRecord];

        return {
            paymentRecord: paymentRecord(saved.paymentRecord),
            treatment: {
                ID: saved.treatment.id,
                状態: saved.treatment.status,
                バージョン: saved.treatment.version,
            },
            summary: calculateSummary(updatedRecords),
        };
    }
}
