# CLAUDE.md

@AGENTS.md

## MARTIAL ARTS ONE（統合アプリポータル）

株式会社 Martial Arts の業務アプリを一つの入口にまとめる社内ポータル。Next.js 16（App Router, `proxy.ts`）+ React 19 + TypeScript strict + Tailwind 4 + shadcn 方式の部品（`src/components/ui/`、cva を手書き）+ Prisma 7 / PostgreSQL 16 + OIDC（openid-client, PKCE）+ RBAC（member / manager / admin）。UI は日本語。

**ポータルはリンクで移動するだけ。** 既存アプリの API・DB・認証には接続しない。電話発信・メール送信・顧客データ更新のコードは置かない。本番デプロイは明示的な承認の後だけ。

- `npm ci && cp .env.example .env.local`（AUTH_MODE=dev と 32 文字以上の SESSION_SECRET）→ `npm run dev`（ポート 3100、3 ロールの開発ログイン、`DATABASE_URL` が空ならメモリ保存）
- テスト（TDD。仕様を `tests/` に先に書く）：`npm test`（Vitest 単体 + `PortalRepo` 契約）、`npm run test:db`（同じ契約を PostgreSQL で。DB を消すので使い捨て DB で）、`npm run test:e2e`（Playwright、開発ログイン、外部接続なし）、`npm run typecheck`、`npm run build`。CI は `.github/workflows/ci.yml`。
- **`src/domain/catalog.ts` の `APPS` が初期データ兼 STEP 1 調査結果**（`docs/01_調査_既存アプリ一覧.md` と一致させる）。URL はデプロイ設定・README に書かれたものだけ（`urlStatus: "documented"` + 出典 `urlSource`）。不明なら `url: null, urlStatus: "unknown"`（推測で埋めない。`resolveLaunch` は unknown・https 以外・認証情報入りの URL を開かない）。`verified` は管理者が画面で付けるだけ。社外秘のアプリを `visibility: "member"` にしない（テストで強制）。
- 層：`src/domain/` は純粋関数（サーバー/ブラウザ共用）、`src/server/` は設定・セッション・OIDC・リポジトリ、`src/app/` は画面と Route Handler / Server Actions。権限は画面で隠すだけでなく、必ずサーバー側で `can()` / `canSeeApp()` を確認する。
- 設定は fail-closed（`src/server/env.ts`）：既定 AUTH_MODE=oidc、本番では dev ログインを拒否、本番は DATABASE_URL・https の APP_URL / OIDC_ISSUER・32 文字以上の秘密鍵が必須。セッションは JWE Cookie、ロールは毎リクエスト DB から読み直す。
- 進捗と未完了：`docs/PROGRESS.md`。
