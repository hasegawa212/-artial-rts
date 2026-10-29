# MARTIAL ARTS ONE

株式会社 Martial Arts の業務アプリを一つの入口にまとめる社内ポータル。
既存アプリには一切手を入れず、**台帳・検索・お気に入り・最近使用・権限・監査ログ** を提供して、各アプリへはリンクで移動するだけ（ログインは各アプリ側）。

- 調査結果：[docs/01_調査_既存アプリ一覧.md](docs/01_調査_既存アプリ一覧.md)
- UI/UX：[docs/02_UIUX設計.md](docs/02_UIUX設計.md) ／ 技術・セキュリティ：[docs/03_技術設計.md](docs/03_技術設計.md)
- 進捗と未完了：[docs/PROGRESS.md](docs/PROGRESS.md)

## ローカルで動かす

```bash
npm ci
cp .env.example .env.local      # AUTH_MODE=dev のまま、SESSION_SECRET に 32 文字以上を入れる
npm run dev                      # http://localhost:3100 → 3 つのロールで仮ログインできる
```

`DATABASE_URL` が空ならメモリ保存（再起動で消える）。PostgreSQL を使うとき：

```bash
DATABASE_URL=postgresql://... npx prisma db push && npm run db:seed
```

## テスト

```bash
npm run typecheck
npm test                                        # 単体・契約（Vitest）
DATABASE_URL=postgresql://.../throwaway npm run test:db   # PostgreSQL 結合（中身を消すので使い捨て DB で）
npm run test:e2e                                # Playwright（開発ログイン＋メモリ、外部接続なし）
npm run build
```

## 本番（承認後のみ）

`AUTH_MODE=oidc`、`OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET`、https の `APP_URL`、`DATABASE_URL`、`SESSION_SECRET`（32 文字以上）が必須。どれかが欠けると起動しない。IdP のリダイレクト URI は `${APP_URL}/api/auth/callback`。ロールは `ADMIN_EMAILS` / `MANAGER_EMAILS`、社外アカウントの拒否は `ALLOWED_EMAIL_DOMAINS`。

## Netlify へのデプロイ

- サイト `martial-arts-one`（https://martial-arts-one.netlify.app）。DB は Netlify Database（`@netlify/database` を入れておくと自動で用意される）。
- スキーマと台帳の初期データは `netlify/database/migrations/` の SQL で、本番公開の直前に自動適用される。**適用済みのマイグレーションは書き換えない**（Netlify が拒否する）。変更は新しいマイグレーションを足す。
- 環境変数（Netlify の画面）：`AUTH_MODE=oidc`、`APP_URL`、`OIDC_ISSUER=https://accounts.google.com`、`OIDC_CLIENT_ID`、`OIDC_CLIENT_SECRET`、`SESSION_SECRET`、`ALLOWED_EMAIL_DOMAINS`、`ADMIN_EMAILS`。`DATABASE_URL` は不要（`NETLIFY_DB_URL` を使う）。
- Google Cloud の OAuth クライアント（ウェブアプリ）の承認済みリダイレクト URI：`https://martial-arts-one.netlify.app/api/auth/callback`。

## アプリを足す・直す

`src/domain/catalog.ts` の `APPS` に追記 → `npm test`（台帳の検証テストが通ること）。本番の DB には、変更分を新しいマイグレーション SQL として `netlify/database/migrations/` に足して反映する。URL は **デプロイ設定や README に書かれたものだけ**（`urlStatus: "documented"` と出典 `urlSource`）。不明なら `url: null, urlStatus: "unknown"`。
