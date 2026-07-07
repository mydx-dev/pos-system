# D1 initial schema

Issue: [#64](https://github.com/mydx-dev/pos-system/issues/64)

## Policy

- D1 physical table and column names use stable English `snake_case`.
- Spreadsheet/API boundary names remain Japanese where the existing GAS contract requires them.
- UUID primary keys are preserved as `TEXT`.
- Optimistic locking is preserved with the `version` column.
- `created_at` and `updated_at` are not added in this initial migration because the current Sheet schema does not have common timestamp columns.
- Booleans are stored as `INTEGER` with `0` / `1` checks.
- Date/time values remain `TEXT` or `INTEGER` according to the current Zod schema.
- Foreign key behavior follows `SheetTable.reference`.
- `password_resets.user_id` and `menus.category_id` add D1 foreign keys even though the current `SheetTable.reference` definition does not declare them. They are intentional constraints derived from the existing schema and domain relationships.

## Migration

Initial migration:

```bash
pnpm --filter @mydx-pos/worker exec wrangler d1 migrations apply mydx-pos-local --local
```

Migration file:

- `apps/worker/migrations/0001_initial_schema.sql`

## Table mapping

| Sheet table | D1 table | Primary key | Notes |
| --- | --- | --- | --- |
| `ユーザー` | `users` | `id` | `email` is unique. `approval` is stored as `0` / `1`. |
| `ロール` | `roles` | `user_id` | References `users.id` with cascade delete. |
| `パスワードリセット` | `password_resets` | `user_id` | `token` is unique. References `users.id` with cascade delete. |
| `レジ端末` | `register_terminals` | `id` | `created_by` restricts user deletion. `updated_by` is set null. |
| `スタッフ` | `employees` | `user_id` | References `users.id` with cascade delete. |
| `顧客` | `customers` | `id` | `primary_staff_id` is set null when the employee is deleted. |
| `メニューカテゴリー` | `menu_categories` | `id` | `name` is unique. |
| `メニュー` | `menus` | `id` | `name` is unique. References `menu_categories.id`. |
| `施術` | `treatments` | `id` | References `customers.id` and `employees.user_id` with restrict delete. |
| `施術メニュー` | `treatment_menus` | `id` | References `treatments.id` with cascade delete and `menus.id` with restrict delete. |
| `精算履歴` | `payment_records` | `id` | References `treatments.id` with cascade delete and self-references target payment records with restrict delete. |

## Column mapping

### users

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `氏名` | `name` | `TEXT NOT NULL` |
| `メールアドレス` | `email` | `TEXT NOT NULL UNIQUE` |
| `パスワード` | `password` | `TEXT NOT NULL` |
| `承認` | `approval` | `INTEGER NOT NULL CHECK (approval IN (0, 1))` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |

### roles

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ユーザーID` | `user_id` | `TEXT PRIMARY KEY`, FK to `users.id` |
| `名称` | `name` | `TEXT NOT NULL CHECK (name IN ('システム管理者', 'ユーザー'))` |

### password_resets

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ユーザーID` | `user_id` | `TEXT PRIMARY KEY`, FK to `users.id` |
| `トークン` | `token` | `TEXT NOT NULL UNIQUE` |
| `有効期限` | `expires_at` | `INTEGER NOT NULL` |

### register_terminals

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `端末名` | `name` | `TEXT NOT NULL` |
| `トークンハッシュ` | `token_hash` | `TEXT NOT NULL` |
| `有効` | `enabled` | `INTEGER NOT NULL CHECK (enabled IN (0, 1))` |
| `発行日時` | `issued_at` | `TEXT NOT NULL` |
| `最終利用日時` | `last_used_at` | `TEXT` |
| `登録者ID` | `created_by` | `TEXT NOT NULL`, FK to `users.id` |
| `更新者ID` | `updated_by` | `TEXT`, FK to `users.id` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |

### employees

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ユーザーID` | `user_id` | `TEXT PRIMARY KEY`, FK to `users.id` |

### customers

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `氏名` | `name` | `TEXT NOT NULL` |
| `主担当スタッフID` | `primary_staff_id` | `TEXT`, FK to `employees.user_id` |
| `担当固定` | `is_staff_fixed` | `INTEGER NOT NULL CHECK (is_staff_fixed IN (0, 1))` |
| `メールアドレス` | `email` | `TEXT` |
| `電話番号` | `phone_number` | `TEXT` |
| `生年月日` | `birth_date` | `TEXT` |
| `郵便番号` | `postal_code` | `TEXT` |
| `住所` | `address` | `TEXT` |
| `備考` | `note` | `TEXT` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |

### menu_categories

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `名称` | `name` | `TEXT NOT NULL UNIQUE` |
| `種別` | `menu_type` | `TEXT NOT NULL CHECK (menu_type IN ('技術', '商品'))` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |

### menus

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `名称` | `name` | `TEXT NOT NULL UNIQUE` |
| `メニュー番号` | `menu_number` | `TEXT NOT NULL` |
| `価格` | `price` | `INTEGER NOT NULL` |
| `仕入れ単価` | `cost_price` | `INTEGER NOT NULL` |
| `税区分` | `tax_type` | `TEXT NOT NULL CHECK (tax_type IN ('内税', '外税'))` |
| `商品区分` | `product_type` | `TEXT NOT NULL CHECK (product_type IN ('店販用', '業務用', '両用'))` |
| `種別` | `menu_type` | `TEXT NOT NULL CHECK (menu_type IN ('技術', '商品'))` |
| `カテゴリーID` | `category_id` | `TEXT NOT NULL`, FK to `menu_categories.id` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |

### treatments

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `顧客ID` | `customer_id` | `TEXT NOT NULL`, FK to `customers.id` |
| `担当スタッフID` | `staff_id` | `TEXT NOT NULL`, FK to `employees.user_id` |
| `状態` | `status` | `TEXT NOT NULL CHECK (status IN ('予約済み', '来店済み', '精算済み'))` |
| `開始日時` | `start_at` | `TEXT NOT NULL` |
| `所要時間` | `duration` | `INTEGER NOT NULL CHECK (duration >= 0)` |
| `備考` | `note` | `TEXT` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |

### treatment_menus

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `施術ID` | `treatment_id` | `TEXT NOT NULL`, FK to `treatments.id` |
| `メニューID` | `menu_id` | `TEXT NOT NULL`, FK to `menus.id` |
| `メニュー名` | `menu_name` | `TEXT NOT NULL` |
| `通常価格` | `regular_price` | `INTEGER NOT NULL` |
| `数量` | `quantity` | `INTEGER NOT NULL CHECK (quantity >= 1)` |
| `値引き額` | `discount_amount` | `INTEGER NOT NULL CHECK (discount_amount >= 0)` |
| `表示順` | `display_order` | `INTEGER NOT NULL` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |

### payment_records

| Sheet column | D1 column | Type / constraint |
| --- | --- | --- |
| `ID` | `id` | `TEXT PRIMARY KEY` |
| `施術ID` | `treatment_id` | `TEXT NOT NULL`, FK to `treatments.id` |
| `種別` | `type` | `TEXT NOT NULL CHECK (type IN ('精算', '取消', '返金'))` |
| `金額` | `amount` | `INTEGER NOT NULL CHECK (amount > 0)` |
| `支払方法` | `payment_method` | `TEXT NOT NULL CHECK (payment_method IN ('現金'))` |
| `発生日時` | `occurred_at` | `TEXT NOT NULL` |
| `備考` | `note` | `TEXT` |
| `対象精算ID` | `target_payment_record_id` | `TEXT`, FK to `payment_records.id` |
| `バージョン` | `version` | `INTEGER NOT NULL CHECK (version >= 0)` |
