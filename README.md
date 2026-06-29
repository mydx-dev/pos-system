# Web App Template

Google Apps Script ベースの XXXX システムです。

Google スプレッドシートをデータストアとして利用し、React で構築した Web UI から ~~~~~~ を行えます。

> This repository is intended for internal use.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Powered by gas-boost](https://img.shields.io/badge/Powered%20by-gas--boost-4CAF50)

## Features

-

## Documentation

| Document                                | Description                            |
| --------------------------------------- | -------------------------------------- |
| [インストールガイド](./docs/INSTALL.md) | システムの導入・デプロイ・初期設定手順 |

## Tech Stack

### Frontend

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [dnd kit](https://dndkit.com/)
- [nuqs](https://nuqs.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

### Backend

- [Google Apps Script](https://developers.google.com/apps-script)
- [clasp](https://github.com/google/clasp)
- [gas-boost](https://github.com/mydx-dev/gas-boost)
- [awilix](https://github.com/jeffijoe/awilix)

### Testing

- [Vitest](https://vitest.dev/)
- インメモリデータストアを利用したバックエンドテスト
- ローカル RPC 環境を利用したフロントエンド開発・テスト

### CI/CD

- [GitHub Actions](https://github.com/features/actions)
- Google Apps Script への自動デプロイ

## Architecture

```text
┌──────────────────────────────────────────────────────┐
│                     React / Vite                      │
│                                                      │
│  Pages / Components / Hooks / TanStack Query / Forms │
└──────────────────────────┬───────────────────────────┘
                           │
                           │ RPC
                           ▼
┌──────────────────────────────────────────────────────┐
│                Google Apps Script API                 │
│                                                      │
│  Controllers → Use Cases → Domain Entities           │
│                      ↓                               │
│               SheetDB / Table Definitions            │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│                Google Spreadsheet                     │
│                                                      │
│  Users / Clients / Deals / Projects / Estimates      │
│  Estimate Items / Requirement Definitions            │
└──────────────────────────────────────────────────────┘
```

### Backend Structure

```text
src/backend/
├── application/
│   ├── service/            # 権限判定などのアプリケーションサービス
│   └── usecase/            # ユースケース
├── controller/             # RPC 入力検証とユースケース呼び出し
├── infrastructure/
│   └── database/           # SheetDB・テーブル定義
├── main.ts                 # GAS エントリーポイント
└── di.ts                   # 依存性注入
```

### Frontend Structure

```text
src/frontend/
├── components/             # 再利用可能な UI コンポーネント
├── hooks/                  # Query・Mutation・認証 Hook
├── lib/                    # Apps Script Client 等の共通処理
├── pages/                  # 画面コンポーネント
└── routes/                 # ルーティング定義
```

### Shared Structure

```text
src/shared/
├── domain/
│   └── entity/             # ドメインエンティティ
├── schemas/                # Zod スキーマ
├── api/                    # API 入出力型
└── routes.ts               # 共有ルート定義
```

## Domain Model

```text

```

## Development

開発には以下が必要です。

- Node.js
- pnpm
- Google アカウント
- Google Apps Script プロジェクト
- Google スプレッドシート
- [clasp](https://github.com/google/clasp)

`clasp` をグローバルにインストールします。

```bash
npm install -g @google/clasp
```

## Setup

### 1. Clone repository

```bash
git clone git@github.com:mydx-dev/degital-forward-budget-manager.git
cd degital-forward-budget-manager
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Login to clasp

```bash
clasp login
```

### 4. Configure Apps Script project

`.clasp.json` を作成し、対象の Google Apps Script プロジェクト ID を設定します。

```json
{
    "scriptId": "YOUR_SCRIPT_ID",
    "rootDir": "../dist"
}
```

> `.clasp.json` は環境固有の設定を含むため、原則として Git 管理しません。

### 5. Configure spreadsheet

## Development

### Start development server

```bash
pnpm dev
```

### Type check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

### Run unit tests

```bash
pnpm test
```

### Run tests with UI

```bash
pnpm test:ui
```

### Run E2E tests

```bash
pnpm test:e2e
```

### Build

```bash
pnpm build
```

## Deployment

ビルド後、Apps Script プロジェクトへ push します。

```bash
pnpm build
pnpm push
```

Apps Script エディタから Web アプリとしてデプロイします。

```text
デプロイ → 新しいデプロイ → ウェブアプリ
```

詳細は [インストールガイド](./docs/installation-guide.md) を参照してください。

## Testing Strategy

| Layer      | Purpose                                      |
| ---------- | -------------------------------------------- |
| Domain     | エンティティの業務ルールを検証               |
| Use Case   | 権限、作成・更新・削除、バージョン更新を検証 |
| Database   | SheetDB の CRUD・制約・永続化を検証          |
| Controller | RPC 入力バリデーションと認証を検証           |
| Frontend   | フォーム、画面遷移、Mutation を検証          |
| E2E        | ユーザー操作を通した主要フローを検証         |

## Release

リリース時は、以下を実施します。

1. `main` ブランチの CI が成功していることを確認する
2. 本番ビルドを作成する
3. Apps Script へデプロイする
4. ステージング環境で主要フローを確認する
5. GitHub Release を作成する
6. ビルド成果物とリリースノートを公開する

導入手順は [インストールガイド](./docs/installation-guide.md) を参照してください。

## Contributing

1. Issue を作成する
2. 作業ブランチを作成する
3. 実装とテストを追加する
4. Pull Request を作成する
5. CI の成功を確認する
6. レビュー後にマージする

ブランチ名の例：

```text
feature/update-estimate
fix/estimate-item-delete
refactor/estimate-usecase
docs/add-installation-guide
```

## License

Private repository.
