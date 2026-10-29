# 進捗（2026-10-28）

## 完了
- [x] STEP 1 調査（`docs/01_調査_既存アプリ一覧.md`、30 件を台帳化）
- [x] STEP 2 UI/UX（ライト/ダーク、PC サイドバー、スマホ下部ナビ、全アプリ検索、お気に入り、最近使用、カテゴリー、プロフィール、管理者画面）
- [x] STEP 3 実装：Next.js / Tailwind / shadcn 方式 / Prisma + PostgreSQL / OIDC / RBAC / 監査ログ
- [x] TDD：単体・契約 55、PostgreSQL 結合 5、E2E 10（デスクトップ 9 + スマホ 1）

## 未完了・要判断
- [ ] **実 IdP での OIDC ログインは未検証**（IdP の発行者・クライアントが無いため。コード交換部分は単体テストなし、E2E は開発ログインで実施）
- [ ] 稼働確認済み URL が 0 件（外部に出られない環境のため）。管理者画面で確認後に更新が必要
- [ ] 各アプリの管理者・一部の認証方式・3 リポジトリ（ma-customer-management / fp / Chat-Bridge）が未確認
- [x] 新規独立リポジトリ `hasegawa212/martial-arts-one` として分離（既存リポジトリには何もコミットしていない）
- [ ] 本番デプロイ：承認済み（2026-10-29、Google Workspace + Netlify + Netlify Database）。サイト作成・環境変数の一部まで。OAuth クライアントと社内ドメインの設定待ち
- [ ] 管理者画面からのアプリ追加・編集（現在は URL 確認状況の変更のみ。台帳は `catalog.ts` → `npm run db:seed`）
- [ ] 実機 Safari での確認（Playwright の Chromium エミュレーションのみ）
