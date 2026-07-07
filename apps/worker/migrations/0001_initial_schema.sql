PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    approval INTEGER NOT NULL CHECK (approval IN (0, 1)),
    version INTEGER NOT NULL CHECK (version >= 0)
);

CREATE TABLE roles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK (name IN ('システム管理者', 'ユーザー')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
    user_id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE register_terminals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    enabled INTEGER NOT NULL CHECK (enabled IN (0, 1)),
    issued_at TEXT NOT NULL,
    last_used_at TEXT,
    created_by TEXT NOT NULL,
    updated_by TEXT,
    version INTEGER NOT NULL CHECK (version >= 0),
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE employees (
    user_id TEXT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    primary_staff_id TEXT,
    is_staff_fixed INTEGER NOT NULL CHECK (is_staff_fixed IN (0, 1)),
    email TEXT,
    phone_number TEXT,
    birth_date TEXT,
    postal_code TEXT,
    address TEXT,
    note TEXT,
    version INTEGER NOT NULL CHECK (version >= 0),
    FOREIGN KEY (primary_staff_id) REFERENCES employees (user_id) ON DELETE SET NULL
);

CREATE TABLE menu_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    menu_type TEXT NOT NULL CHECK (menu_type IN ('技術', '商品')),
    version INTEGER NOT NULL CHECK (version >= 0)
);

CREATE TABLE menus (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    menu_number TEXT NOT NULL,
    price INTEGER NOT NULL,
    cost_price INTEGER NOT NULL,
    tax_type TEXT NOT NULL CHECK (tax_type IN ('内税', '外税')),
    product_type TEXT NOT NULL CHECK (product_type IN ('店販用', '業務用', '両用')),
    menu_type TEXT NOT NULL CHECK (menu_type IN ('技術', '商品')),
    category_id TEXT NOT NULL,
    version INTEGER NOT NULL CHECK (version >= 0),
    FOREIGN KEY (category_id) REFERENCES menu_categories (id) ON DELETE RESTRICT
);

CREATE TABLE treatments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('予約済み', '来店済み', '精算済み')),
    start_at TEXT NOT NULL,
    duration INTEGER NOT NULL CHECK (duration >= 0),
    note TEXT,
    version INTEGER NOT NULL CHECK (version >= 0),
    FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT,
    FOREIGN KEY (staff_id) REFERENCES employees (user_id) ON DELETE RESTRICT
);

CREATE TABLE treatment_menus (
    id TEXT PRIMARY KEY,
    treatment_id TEXT NOT NULL,
    menu_id TEXT NOT NULL,
    menu_name TEXT NOT NULL,
    regular_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    discount_amount INTEGER NOT NULL CHECK (discount_amount >= 0),
    display_order INTEGER NOT NULL,
    version INTEGER NOT NULL CHECK (version >= 0),
    FOREIGN KEY (treatment_id) REFERENCES treatments (id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus (id) ON DELETE RESTRICT
);

CREATE TABLE payment_records (
    id TEXT PRIMARY KEY,
    treatment_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('精算', '取消', '返金')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('現金')),
    occurred_at TEXT NOT NULL,
    note TEXT,
    target_payment_record_id TEXT,
    version INTEGER NOT NULL CHECK (version >= 0),
    FOREIGN KEY (treatment_id) REFERENCES treatments (id) ON DELETE CASCADE,
    FOREIGN KEY (target_payment_record_id) REFERENCES payment_records (id) ON DELETE RESTRICT
);

CREATE INDEX idx_register_terminals_created_by ON register_terminals (created_by);
CREATE INDEX idx_register_terminals_updated_by ON register_terminals (updated_by);
CREATE INDEX idx_customers_primary_staff_id ON customers (primary_staff_id);
CREATE INDEX idx_menus_category_id ON menus (category_id);
CREATE INDEX idx_treatments_customer_id ON treatments (customer_id);
CREATE INDEX idx_treatments_staff_id ON treatments (staff_id);
CREATE INDEX idx_treatment_menus_treatment_id ON treatment_menus (treatment_id);
CREATE INDEX idx_treatment_menus_menu_id ON treatment_menus (menu_id);
CREATE INDEX idx_payment_records_treatment_id ON payment_records (treatment_id);
CREATE INDEX idx_payment_records_target_payment_record_id
    ON payment_records (target_payment_record_id);
