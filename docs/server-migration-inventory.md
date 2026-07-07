# GAS backend dependency inventory

Issue: [#54](https://github.com/mydx-dev/pos-system/issues/54)

## Purpose

GAS iframe から WebUSB を利用できないため、フロントエンドを `apps/web` のトップレベル React アプリへ移行する前提で、既存 GAS バックエンドの依存を棚卸しする。

この資料では実装移行は行わず、次の実装 Issue に分割できる状態まで整理する。

## Summary

- GAS API への直接依存は主に `apps/gas/src/backend/di.ts` に集約されている。
- ただし、usecase/service/controller の一部は `GoogleAppsScript.*` 型や `@mydx-dev/gas-boost-runtime` の `SheetDB` / `SheetTable` / `AppsScriptServerResponse` に直接依存している。
- 現状のデータアクセスは Spreadsheet を `SheetDB` と `SheetTable` で扱う構成のため、Cloudflare Workers 等へ移す場合は repository / datastore の抽象化が先に必要。
- controller は GAS の `google.script.run` 向け戻り値 `AppsScriptServerResponse` に寄っているため、Web 版では HTTP handler と共通 response contract を別途用意する必要がある。
- 優先候補は Cloudflare Workers + D1。現在の SheetTable 定義は SQLite テーブルへ変換しやすく、低コストで Cloudflare Pages と組み合わせやすい。

## GAS specific API usage

| API / dependency                   | Main files                                                                                                                                                                                    | Current role                                               | Migration note                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `SpreadsheetApp`                   | `apps/gas/src/backend/di.ts`, `apps/gas/src/backend/controller/OnOpenController.ts`                                                                                                           | Active spreadsheet ID, `SheetGateway`, spreadsheet UI menu | GAS adapter に残す。Worker では D1 / Supabase repository に置換する。                                        |
| `CacheService` / `Cache`           | `apps/gas/src/backend/di.ts`, `Authentication.ts`, `LoginUserUseCase.ts`, `LogoutUserUseCase.ts`                                                                                              | session token storage                                      | cache/session store interface を作り、GAS は CacheService、Worker は KV / D1 / Durable Object 等に置換する。 |
| `PropertiesService` / `Properties` | `apps/gas/src/backend/di.ts`, `AcceptTermsUseCase.ts`, `IsSetupCompletedUseCase.ts`, `IsTermsAcceptedUseCase.ts`, `PasswordProtection.ts`, `SetupSystemUseCase.ts`, `DoGetUseCase.ts`         | setup state, terms state, password pepper                  | settings/secrets store interface を作る。pepper は Worker 環境変数や secret binding へ移す。                 |
| `Utilities`                        | `apps/gas/src/backend/di.ts`, `PasswordProtection.ts`, `CreateUserUseCase.ts`, `LoginUserUseCase.ts`, `ForgotPasswordUseCase.ts`, `SetupSystemUseCase.ts`, `CreateRegisterTerminalUseCase.ts` | UUID, digest, random/token/hash helpers                    | crypto utility interface を作り、Worker は Web Crypto に置換する。                                           |
| `Session`                          | `apps/gas/src/backend/di.ts`, `CreateUserUseCase.ts`, `SetupSystemUseCase.ts`                                                                                                                 | effective user email 取得                                  | Web 版では authenticated actor を HTTP request context から渡す。                                            |
| `GmailApp`                         | `apps/gas/src/backend/di.ts`, `CreateUserUseCase.ts`, `ForgotPasswordUseCase.ts`                                                                                                              | approval / password reset email                            | mailer interface を作り、GAS は GmailApp、Worker は SendGrid / Resend / MailChannels 等に置換する。          |
| `ScriptApp`                        | `apps/gas/src/backend/di.ts`, `CreateUserUseCase.ts`, `ForgotPasswordUseCase.ts`, `DoGetUseCase.ts`                                                                                           | service URL / script ID                                    | Web 版では public app URL / API base URL を config から取得する。                                            |
| `HtmlService`                      | `apps/gas/src/backend/di.ts`, `DoGetUseCase.ts`                                                                                                                                               | GAS HTML shell rendering, X-Frame-Options                  | `apps/web` 移行後は不要。GAS 版 adapter に閉じ込める。                                                       |
| `Logger`                           | `apps/gas/src/backend/di.ts`, `SetupSystemUseCase.ts`, `SetupSystemController.ts`                                                                                                             | setup logging                                              | logger interface を作り、Worker は `console` / observability service に置換する。                            |
| Spreadsheet UI                     | `apps/gas/src/backend/controller/OnOpenController.ts`                                                                                                                                         | custom menu / open sidebar                                 | Web 版では不要。GAS 専用 controller として残す。                                                             |
| clasp / gasboost                   | `README.md`, `docs/INSTALL.md`, `apps/gas/package.json`, `apps/gas/gasboost.json`                                                                                                             | GAS build/deploy                                           | `apps/gas` に残す。Web / Worker は Vite / Wrangler 等に分離する。                                            |

検索対象に `LockService`, `UrlFetchApp`, `ContentService`, `google.script.run`, Apps Script trigger の直接利用は見当たらない。フロントエンド側の GAS RPC は `@mydx-dev/gas-boost-react-apps-script` 経由で隠蔽されている可能性があるため、Web 移行時に RPC client を差し替える。

## gas-boost runtime dependency

GAS API そのものではないが、サーバー移行で重要な依存がある。

| Dependency                  | Main files                                                                            | Role                                                | Migration note                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SheetDB`                   | most `application/usecase/*.ts`, `application/service/*.ts`, `MigrationController.ts` | Spreadsheet-backed repository facade                | `server-core` 切り出し前に repository port へ置換する。                                     |
| `SheetTable`                | `apps/gas/src/backend/infrastructure/database/tables.ts`                              | table definition, serialize/deserialize, references | D1 / Postgres schema 生成の元情報として使えるが、runtime dependency は adapter 側へ寄せる。 |
| `SheetGateway`              | `apps/gas/src/backend/di.ts`                                                          | Spreadsheet access gateway                          | GAS adapter に残す。                                                                        |
| `AppsScriptServerResponse`  | most controller files, `apps/gas/src/shared/api/index.ts`                             | `google.script.run` 向け response wrapper           | HTTP API では status code / JSON response に置換する。                                      |
| gas-boost testing utilities | specs and `apps/gas/src/backend/di.mock.ts`                                           | Node test doubles for GAS APIs                      | adapter 分離後は core tests と adapter tests に分ける。                                     |

## Server-side classification

### 1. Can move toward `packages/server-core`

These are mostly business rules, but many currently accept `SheetDB` directly. They should move after introducing repository ports.

- Domain entities: `apps/gas/src/shared/domain/entity/*`
- Value objects that do not need GAS APIs:
    - `Receipt.ts`
    - `RegisterTerminalPlaneToken.ts`
    - `Terms.ts`
    - `TreatmentDuration.ts`
    - `TreatmentStartDate.ts`
    - `TreatmentEndDate.ts`
    - `UserEmail.ts`
    - `UserPassword.ts`
- Shared schemas:
    - `apps/gas/src/shared/schemas/database.ts`
    - `apps/gas/src/shared/schemas/form.ts`
- API request / response schemas:
    - `apps/gas/src/shared/api/customer.ts`
    - `employee.ts`
    - `menu.ts`
    - `menuCategory.ts`
    - `paymentRecord.ts`
    - `registerTerminal.ts`
    - `system.ts`
    - `treatment.ts`
    - `user.ts`
- Business usecases after replacing `SheetDB` with ports:
    - `ApproveUserUseCase`
    - `CreateCustomerUseCase`
    - `CreateEmployeeUseCase`
    - `CreatePaymentRecordUseCase`
    - `CreateTreatmentUseCase`
    - `DeleteUserUseCase`
    - `LoginRegisterTerminalUseCase`
    - `PullDataBaseUseCase`
    - `PullDatabaseRegisterTerminalUseCase`
    - `RefreshRegisterTerminalTokenUseCase`
    - `ResetPasswordUseCase`
    - `SaveMenuCategoryUseCase`
    - `SaveMenuUseCase`
    - `SaveTreatmentMenusUseCase`
    - `UnapproveUserUseCase`
    - `UpdateUserUseCase`
- Application services after replacing `SheetDB` / cache with ports:
    - `ExistsCheck`
    - `PermissionCheck`
    - `RegisterTerminalAuthentication`
    - `SystemAdmins`

### 2. GAS adapter layer

These should stay in `apps/gas` or move to a future `packages/gas-adapter`.

- DI bindings in `apps/gas/src/backend/di.ts`
- Spreadsheet-backed table/runtime definitions in `apps/gas/src/backend/infrastructure/database/tables.ts`
- `SheetGateway`, `SheetDB`, and `SheetTable` runtime usage
- `OnOpenController` and `OpenController`
- `DoGetUseCase` / `DoGetController`
- `MigrationController` for Spreadsheet schema setup
- GAS implementations for:
    - data store
    - session cache
    - properties/settings
    - crypto utilities
    - mailer
    - logger
    - app URL provider

### 3. Needs abstraction before moving to `server-core`

These contain business behavior but directly depend on GAS services.

- `PasswordProtection`: depends on `Utilities` and `Properties`.
- `Authentication`: depends on `GoogleAppsScript.Cache.Cache`.
- `LoginUserUseCase`: depends on `Utilities`, `SheetDB`, and `Cache`.
- `LogoutUserUseCase`: depends on `Cache`.
- `CreateUserUseCase`: depends on `Utilities`, `SheetDB`, `Session`, `GmailApp`, and `ScriptApp`.
- `ForgotPasswordUseCase`: depends on `SheetDB`, `Utilities`, `GmailApp`, and `ScriptApp`.
- `CreateRegisterTerminalUseCase`: depends on `Utilities`, `PasswordProtection`, and `SheetDB`.
- `SetupSystemUseCase`: depends on `SheetDB`, `Properties`, `Utilities`, `Session`, and `Logger`.
- `AcceptTermsUseCase`, `IsSetupCompletedUseCase`, `IsTermsAcceptedUseCase`: depend on `Properties`.

### 4. HTTP API layer to rebuild for Web

Current controllers are GAS RPC endpoints exposed by `apps/gas/src/backend/main.ts`. Web 版では HTTP routes or RPC handlers として再実装する。

Suggested route shape:

| Current server function        | Suggested HTTP route                     | Auth                    |
| ------------------------------ | ---------------------------------------- | ----------------------- |
| `setupSystem`                  | `POST /rpc/setupSystem`                  | setup/admin bootstrap   |
| `migration`                    | not exposed in production HTTP           | admin only / ops task   |
| `isSetupCompleted`             | `GET /rpc/isSetupCompleted`              | public                  |
| `isTermsAccepted`              | `GET /rpc/isTermsAccepted`               | public                  |
| `acceptTerms`                  | `POST /rpc/acceptTerms`                  | public or setup flow    |
| `createUser`                   | `POST /rpc/createUser`                   | public registration     |
| `loginUser`                    | `POST /rpc/loginUser`                    | public                  |
| `logoutUser`                   | `POST /rpc/logoutUser`                   | session token           |
| `approveUser`                  | `POST /rpc/approveUser`                  | staff/admin session     |
| `unapproveUser`                | `POST /rpc/unapproveUser`                | staff/admin session     |
| `updateUser`                   | `POST /rpc/updateUser`                   | staff/admin session     |
| `deleteUser`                   | `POST /rpc/deleteUser`                   | staff/admin session     |
| `forgotPassword`               | `POST /rpc/forgotPassword`               | public                  |
| `resetPassword`                | `POST /rpc/resetPassword`                | reset token             |
| `pullDatabase`                 | `POST /rpc/pullDatabase`                 | session token           |
| `createEmployee`               | `POST /rpc/createEmployee`               | staff/admin session     |
| `createCustomer`               | `POST /rpc/createCustomer`               | staff/admin session     |
| `saveMenuCategory`             | `POST /rpc/saveMenuCategory`             | staff/admin session     |
| `saveMenu`                     | `POST /rpc/saveMenu`                     | staff/admin session     |
| `createTreatment`              | `POST /rpc/createTreatment`              | staff/admin session     |
| `saveTreatmentMenus`           | `POST /rpc/saveTreatmentMenus`           | staff/admin session     |
| `createPaymentRecord`          | `POST /rpc/createPaymentRecord`          | register terminal token |
| `createRegisterTerminal`       | `POST /rpc/createRegisterTerminal`       | staff/admin session     |
| `refreshRegisterTerminalToken` | `POST /rpc/refreshRegisterTerminalToken` | staff/admin session     |
| `loginRegisterTerminal`        | `POST /rpc/loginRegisterTerminal`        | terminal token          |
| `pullDatabaseRegisterTerminal` | `POST /rpc/pullDatabaseRegisterTerminal` | register terminal token |

`doGet`, `onOpen`, and `open` are GAS UI entrypoints and should not be part of the Web HTTP API.

## Database migration inventory

Current source of truth: `apps/gas/src/backend/infrastructure/database/tables.ts` and `apps/gas/src/shared/schemas/database.ts`.

| Current sheet        | Primary key  | Important constraints / references                                              |
| -------------------- | ------------ | ------------------------------------------------------------------------------- |
| `ユーザー`           | `ID`         | unique `ID`, unique `メールアドレス`, version column `バージョン`               |
| `ロール`             | `ユーザーID` | references `ユーザー.ID` cascade, role enum                                     |
| `パスワードリセット` | `ユーザーID` | token unique, expires timestamp                                                 |
| `レジ端末`           | `ID`         | references creator/updater user, version column                                 |
| `スタッフ`           | `ユーザーID` | references `ユーザー.ID` cascade                                                |
| `顧客`               | `ID`         | references `スタッフ.ユーザーID` set null, version column                       |
| `メニューカテゴリー` | `ID`         | unique `名称`, version column                                                   |
| `メニュー`           | `ID`         | unique `名称`, references category, version column                              |
| `施術`               | `ID`         | references customer and staff, version column                                   |
| `施術メニュー`       | `ID`         | references treatment cascade and menu restrict, version column                  |
| `精算履歴`           | `ID`         | references treatment cascade and target payment record restrict, version column |

Migration notes:

- Preserve optimistic locking via `バージョン`.
- Preserve UUID primary keys.
- Decide whether physical DB column names remain Japanese or move to stable English names with mapping at API boundaries.
- Keep `PullDataBaseUseCase` and `PullDatabaseRegisterTerminalUseCase` behavior in mind; offline/local sync consumers expect table names, primary keys, and serialized records.
- Add explicit created/updated timestamps only as a separate migration Issue; they are not present in the current sheet schema except specific domain fields.

## Migration target comparison

| Option                        | Fit                                                | Pros                                                                                                                     | Cons                                                                                                                  |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Workers + D1       | Best first candidate                               | Low cost, HTTP API and SQLite DB in one platform, works well with Cloudflare Pages, relational model fits current tables | D1 operational constraints and migrations need design; auth/session/mail need bindings or external services           |
| Cloudflare Workers + Supabase | Strong candidate if admin UI / SQL tooling matters | Postgres, dashboard, backups, RLS options, easier ad hoc data inspection                                                 | Additional service and network hop; cost/ops surface is larger than D1                                                |
| Firebase                      | Lower priority                                     | Google ecosystem familiarity, Auth/Hosting/Firestore available                                                           | Spreadsheet relational model requires more redesign; Firestore is not a natural fit for current relational references |

Decision: prefer Cloudflare Workers + D1 for the first server migration spike. Keep Supabase as fallback if reporting/admin operations or Postgres features become important.

## Proposed package split

```text
packages/shared
  API schemas, database schemas, domain types shared by web / worker / gas

packages/server-core
  usecases and services that depend only on repository/cache/settings/mailer/crypto/logger ports

packages/gas-adapter
  SheetDB, SheetTable, SpreadsheetApp, CacheService, PropertiesService, GmailApp implementations

packages/worker-adapter
  D1 repositories, KV/session/settings bindings, Web Crypto, mail provider, HTTP handlers

packages/rpc
  GasRpcClient and HttpRpcClient with the same client-facing contract
```

The first practical step is not moving files. It is introducing small ports around data access and GAS services so each usecase can be moved without a behavior rewrite.

## Suggested next Issues

1. Introduce repository/cache/settings/crypto/mailer/logger ports without changing runtime behavior.
2. Move domain entities, value objects, schemas, and API contracts into `packages/shared`.
3. Replace direct `SheetDB` references in one narrow usecase group with repository ports as a migration pattern.
4. Add `packages/rpc` with `GasRpcClient` and planned `HttpRpcClient` contract.
5. Create `apps/worker` skeleton with Cloudflare Workers + D1, no business routes yet.
6. Generate initial D1 migration from current SheetTable/schema definitions.
7. Implement HTTP handlers for read/setup/auth endpoints first: `isSetupCompleted`, `isTermsAccepted`, `loginUser`, `logoutUser`, `pullDatabase`.
8. Implement register terminal endpoints required by WebUSB POS flow: `loginRegisterTerminal`, `pullDatabaseRegisterTerminal`, `createPaymentRecord`.

## Completion checklist for Issue 54

- [x] GAS specific API dependency locations are listed.
- [x] SpreadsheetApp and SheetDB dependencies are separated.
- [x] Session, PropertiesService, CacheService, Utilities, GmailApp, ScriptApp, HtmlService, Logger dependencies are classified.
- [x] controller / usecase / repository / infrastructure responsibilities are classified.
- [x] `server-core` extraction candidates are listed.
- [x] GAS adapter candidates are listed.
- [x] Web HTTP API candidates are listed.
- [x] DB migration tables and constraints are summarized.
- [x] Migration target recommendation is documented.
- [x] Follow-up implementation Issues can be created from the proposed next Issues.
