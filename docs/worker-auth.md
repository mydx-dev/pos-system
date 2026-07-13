# Cloudflare Worker 認証

Cloudflare 版の管理画面認証は Better Auth を利用します。レジ端末認証は従来どおり `register_terminal_sessions` と `register_session` Cookie を使い、Better Auth には統合しません。

## 環境変数

`BETTER_AUTH_SECRET` は Wrangler Secret として登録してください。

```bash
pnpm --filter @mydx-pos/worker wrangler secret put BETTER_AUTH_SECRET
```

ローカル開発では `apps/worker/.dev.vars` に設定します。実値は Git にコミットしません。

```text
BETTER_AUTH_SECRET="openssl-rand-base64-32などで生成した値"
```

Web と Worker が別 origin の場合は、`CORS_ALLOWED_ORIGINS` と `TRUSTED_ORIGINS` に Web の origin を設定します。Cookie を送受信するため、許可 origin は `*` にしません。

## マイグレーション

Better Auth 用に以下のテーブルを D1 へ追加します。

- `user`
- `session`
- `account`
- `verification`

ローカル適用:

```bash
pnpm --filter @mydx-pos/worker db:migrations:apply:local
```

本番適用:

```bash
pnpm --filter @mydx-pos/worker db:migrations:apply:remote
```

## 初期管理者

初期管理者は `/rpc/createUser` で作成します。初回のみ未認証で実行でき、Better Auth の `user/account` と POS 側の `users/roles` が同じ `user.id` で作成されます。

セットアップ完了後のユーザー作成は、Better Auth セッションを持つ `システム管理者` のみ実行できます。公開の `/api/auth/sign-up/email` は無効です。
