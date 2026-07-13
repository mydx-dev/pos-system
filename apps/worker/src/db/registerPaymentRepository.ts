import type { MenuType } from '@mydx-pos/shared/domain/entity/MenuCategory';
import type {
    PaymentMethod,
    PaymentRecordType,
} from '@mydx-pos/shared/domain/entity/PaymentRecord';
import type { TreatmentStatus } from '@mydx-pos/shared/domain/entity/Treatment';

export type RegisterTerminalRecord = {
    id: string;
    name: string;
    token_hash: string;
    enabled: number;
    issued_at: string;
    last_used_at: string | null;
    created_by: string;
    updated_by: string | null;
    version: number;
};

export type RegisterTerminalSessionRecord = {
    token_hash: string;
    register_terminal_id: string;
    expires_at: number;
    created_at: string;
    last_used_at: string | null;
};

export type UserRecord = {
    id: string;
    name: string;
    email: string;
    password: string;
    approval: number;
    version: number;
};

export type EmployeeRecord = {
    user_id: string;
};

export type CustomerRecord = {
    id: string;
    name: string;
    primary_staff_id: string | null;
    is_staff_fixed: number;
    email: string | null;
    phone_number: string | null;
    birth_date: string | null;
    postal_code: string | null;
    address: string | null;
    note: string | null;
    version: number;
};

export type MenuCategoryRecord = {
    id: string;
    name: string;
    menu_type: MenuType;
    version: number;
};

export type MenuRecord = {
    id: string;
    name: string;
    menu_number: string;
    price: number;
    cost_price: number;
    tax_type: '内税' | '外税';
    product_type: '店販用' | '業務用' | '両用';
    menu_type: MenuType;
    category_id: string;
    version: number;
};

export type TreatmentRecord = {
    id: string;
    customer_id: string;
    staff_id: string;
    status: TreatmentStatus;
    start_at: string;
    duration: number;
    note: string | null;
    version: number;
};

export type RegisterTreatmentListRecord = {
    id: string;
    customer_id: string;
    customer_name: string;
    staff_id: string;
    staff_name: string;
    status: TreatmentStatus;
    start_at: string;
    total_amount: number;
    version: number;
};

export type TreatmentMenuRecord = {
    id: string;
    treatment_id: string;
    menu_id: string;
    menu_name: string;
    regular_price: number;
    quantity: number;
    discount_amount: number;
    display_order: number;
    version: number;
};

export type PaymentRecordRow = {
    id: string;
    treatment_id: string;
    type: PaymentRecordType;
    amount: number;
    payment_method: PaymentMethod;
    occurred_at: string;
    note: string | null;
    target_payment_record_id: string | null;
    version: number;
};

export type PaymentRecordInputRow = Omit<PaymentRecordRow, 'version'> & {
    version?: number;
};

export type PaymentRecordWithTreatment = {
    paymentRecord: PaymentRecordRow;
    treatment: TreatmentRecord;
};

const firstOrNull = async <T>(statement: D1PreparedStatement) =>
    (await statement.first<T>()) ?? null;

export class RegisterPaymentRepository {
    constructor(private readonly db: D1Database) {}

    async listEnabledRegisterTerminals() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    name,
                    token_hash,
                    enabled,
                    issued_at,
                    last_used_at,
                    created_by,
                    updated_by,
                    version
                 FROM register_terminals
                 WHERE enabled = 1`
            )
            .all<RegisterTerminalRecord>();

        return result.results;
    }

    async markRegisterTerminalUsed(id: string, usedAt: string) {
        const terminal = await this.db
            .prepare(
                `UPDATE register_terminals
                 SET last_used_at = ?
                 WHERE id = ? AND enabled = 1
                 RETURNING
                    id,
                    name,
                    token_hash,
                    enabled,
                    issued_at,
                    last_used_at,
                    created_by,
                    updated_by,
                    version`
            )
            .bind(usedAt, id)
            .first<RegisterTerminalRecord>();

        return terminal ?? null;
    }

    async createRegisterTerminalSession(
        tokenHash: string,
        registerTerminalId: string,
        expiresAt: number,
        createdAt: string
    ) {
        await this.db
            .prepare(
                `INSERT INTO register_terminal_sessions
                    (token_hash, register_terminal_id, expires_at, created_at, last_used_at)
                 VALUES (?, ?, ?, ?, ?)`
            )
            .bind(tokenHash, registerTerminalId, expiresAt, createdAt, createdAt)
            .run();
    }

    async findActiveRegisterTerminalBySession(
        tokenHash: string,
        nowMs: number
    ) {
        const terminal = await this.db
            .prepare(
                `SELECT
                    register_terminals.id,
                    register_terminals.name,
                    register_terminals.token_hash,
                    register_terminals.enabled,
                    register_terminals.issued_at,
                    register_terminals.last_used_at,
                    register_terminals.created_by,
                    register_terminals.updated_by,
                    register_terminals.version
                 FROM register_terminal_sessions
                 INNER JOIN register_terminals
                    ON register_terminals.id = register_terminal_sessions.register_terminal_id
                 WHERE
                    register_terminal_sessions.token_hash = ?
                    AND register_terminal_sessions.expires_at > ?
                    AND register_terminals.enabled = 1
                 LIMIT 1`
            )
            .bind(tokenHash, nowMs)
            .first<RegisterTerminalRecord>();

        return terminal ?? null;
    }

    async touchRegisterTerminalSession(tokenHash: string, lastUsedAt: string) {
        await this.db
            .prepare(
                `UPDATE register_terminal_sessions
                 SET last_used_at = ?
                 WHERE token_hash = ?`
            )
            .bind(lastUsedAt, tokenHash)
            .run();
    }

    async deleteRegisterTerminalSession(tokenHash: string) {
        await this.db
            .prepare(
                `DELETE FROM register_terminal_sessions
                 WHERE token_hash = ?`
            )
            .bind(tokenHash)
            .run();
    }

    async listCustomers() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    name,
                    primary_staff_id,
                    is_staff_fixed,
                    email,
                    phone_number,
                    birth_date,
                    postal_code,
                    address,
                    note,
                    version
                 FROM customers
                 ORDER BY id`
            )
            .all<CustomerRecord>();

        return result.results;
    }

    async listEmployees() {
        const result = await this.db
            .prepare('SELECT user_id FROM employees ORDER BY user_id')
            .all<EmployeeRecord>();

        return result.results;
    }

    async listUsers() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    name,
                    email,
                    password,
                    approval,
                    version
                 FROM users
                 ORDER BY id`
            )
            .all<UserRecord>();

        return result.results;
    }

    async listTreatments() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    customer_id,
                    staff_id,
                    status,
                    start_at,
                    duration,
                    note,
                    version
                 FROM treatments
                 ORDER BY id`
            )
            .all<TreatmentRecord>();

        return result.results;
    }

    async listRegisterTreatments() {
        const result = await this.db
            .prepare(
                `SELECT
                    treatments.id,
                    treatments.customer_id,
                    customers.name AS customer_name,
                    treatments.staff_id,
                    users.name AS staff_name,
                    treatments.status,
                    treatments.start_at,
                    COALESCE(
                        SUM(
                            (treatment_menus.regular_price - treatment_menus.discount_amount)
                            * treatment_menus.quantity
                        ),
                        0
                    ) AS total_amount,
                    treatments.version
                 FROM treatments
                 INNER JOIN customers
                    ON customers.id = treatments.customer_id
                 INNER JOIN users
                    ON users.id = treatments.staff_id
                 LEFT JOIN treatment_menus
                    ON treatment_menus.treatment_id = treatments.id
                 WHERE treatments.status IN ('予約済み', '来店済み', '精算済み')
                 GROUP BY
                    treatments.id,
                    treatments.customer_id,
                    customers.name,
                    treatments.staff_id,
                    users.name,
                    treatments.status,
                    treatments.start_at,
                    treatments.version
                 ORDER BY treatments.start_at, treatments.id`
            )
            .all<RegisterTreatmentListRecord>();

        return result.results;
    }

    async listTreatmentMenus() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    treatment_id,
                    menu_id,
                    menu_name,
                    regular_price,
                    quantity,
                    discount_amount,
                    display_order,
                    version
                 FROM treatment_menus
                 ORDER BY display_order, id`
            )
            .all<TreatmentMenuRecord>();

        return result.results;
    }

    async listTreatmentMenusByTreatmentId(treatmentId: string) {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    treatment_id,
                    menu_id,
                    menu_name,
                    regular_price,
                    quantity,
                    discount_amount,
                    display_order,
                    version
                 FROM treatment_menus
                 WHERE treatment_id = ?
                 ORDER BY display_order, id`
            )
            .bind(treatmentId)
            .all<TreatmentMenuRecord>();

        return result.results;
    }

    async listMenus() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    name,
                    menu_number,
                    price,
                    cost_price,
                    tax_type,
                    product_type,
                    menu_type,
                    category_id,
                    version
                 FROM menus
                 ORDER BY menu_number, id`
            )
            .all<MenuRecord>();

        return result.results;
    }

    async listMenuCategories() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    name,
                    menu_type,
                    version
                 FROM menu_categories
                 ORDER BY name, id`
            )
            .all<MenuCategoryRecord>();

        return result.results;
    }

    async listPaymentRecords() {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    treatment_id,
                    type,
                    amount,
                    payment_method,
                    occurred_at,
                    note,
                    target_payment_record_id,
                    version
                 FROM payment_records
                 ORDER BY occurred_at, id`
            )
            .all<PaymentRecordRow>();

        return result.results;
    }

    findTreatmentById(id: string) {
        return firstOrNull<TreatmentRecord>(
            this.db
                .prepare(
                    `SELECT
                        id,
                        customer_id,
                        staff_id,
                        status,
                        start_at,
                        duration,
                        note,
                        version
                     FROM treatments
                     WHERE id = ?
                     LIMIT 1`
                )
                .bind(id)
        );
    }

    findCustomerById(id: string) {
        return firstOrNull<CustomerRecord>(
            this.db
                .prepare(
                    `SELECT
                        id,
                        name,
                        primary_staff_id,
                        is_staff_fixed,
                        email,
                        phone_number,
                        birth_date,
                        postal_code,
                        address,
                        note,
                        version
                     FROM customers
                     WHERE id = ?
                     LIMIT 1`
                )
                .bind(id)
        );
    }

    findUserById(id: string) {
        return firstOrNull<UserRecord>(
            this.db
                .prepare(
                    `SELECT
                        id,
                        name,
                        email,
                        password,
                        approval,
                        version
                     FROM users
                     WHERE id = ?
                     LIMIT 1`
                )
                .bind(id)
        );
    }

    async listPaymentRecordsByTreatmentId(treatmentId: string) {
        const result = await this.db
            .prepare(
                `SELECT
                    id,
                    treatment_id,
                    type,
                    amount,
                    payment_method,
                    occurred_at,
                    note,
                    target_payment_record_id,
                    version
                 FROM payment_records
                 WHERE treatment_id = ?
                 ORDER BY occurred_at, id`
            )
            .bind(treatmentId)
            .all<PaymentRecordRow>();

        return result.results;
    }

    async createPaymentRecord(
        paymentRecord: PaymentRecordInputRow,
        shouldMarkTreatmentPaid: boolean
    ): Promise<PaymentRecordWithTreatment> {
        const insertPayment = this.db
            .prepare(
                `INSERT INTO payment_records
                    (
                        id,
                        treatment_id,
                        type,
                        amount,
                        payment_method,
                        occurred_at,
                        note,
                        target_payment_record_id,
                        version
                    )
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 RETURNING
                    id,
                    treatment_id,
                    type,
                    amount,
                    payment_method,
                    occurred_at,
                    note,
                    target_payment_record_id,
                    version`
            )
            .bind(
                paymentRecord.id,
                paymentRecord.treatment_id,
                paymentRecord.type,
                paymentRecord.amount,
                paymentRecord.payment_method,
                paymentRecord.occurred_at,
                paymentRecord.note ?? null,
                paymentRecord.target_payment_record_id ?? null,
                paymentRecord.version ?? 1
            );

        const updateTreatment = this.db
            .prepare(
                shouldMarkTreatmentPaid
                    ? `UPDATE treatments
                       SET status = '精算済み',
                           version = version + 1
                       WHERE id = ?
                       RETURNING
                            id,
                            customer_id,
                            staff_id,
                            status,
                            start_at,
                            duration,
                            note,
                            version`
                    : `SELECT
                            id,
                            customer_id,
                            staff_id,
                            status,
                            start_at,
                            duration,
                            note,
                            version
                       FROM treatments
                       WHERE id = ?`
            )
            .bind(paymentRecord.treatment_id);

        const [insertResult, treatmentResult] = await this.db.batch([
            insertPayment,
            updateTreatment,
        ]);

        const savedPaymentRecord = insertResult.results?.[0] as
            | PaymentRecordRow
            | undefined;
        const savedTreatment = treatmentResult.results?.[0] as
            | TreatmentRecord
            | undefined;

        if (!savedPaymentRecord || !savedTreatment) {
            throw new Error('Failed to create payment record.');
        }

        return {
            paymentRecord: savedPaymentRecord,
            treatment: savedTreatment,
        };
    }
}
