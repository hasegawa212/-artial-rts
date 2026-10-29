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

## アプリを足す・直す

`src/domain/catalog.ts` の `APPS` に追記 → `npm test`（台帳の検証テストが通ること）→ `npm run db:seed`。URL は **デプロイ設定や README に書かれたものだけ**（`urlStatus: "documented"` と出典 `urlSource`）。不明なら `url: null, urlStatus: "unknown"`。
