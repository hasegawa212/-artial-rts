# 進捗（2026-10-29 完成判定）

## A：完成済み（触らない）
- [x] STEP 1 調査（`docs/01_調査_既存アプリ一覧.md`、30 件を台帳化）
- [x] 画面：ホーム・すべてのアプリ・詳細・お気に入り・最近使用・カテゴリー・プロフィール・管理者（URL 確認状況・ロール・監査ログ）、⌘K 全アプリ検索、ライト／ダーク、PC サイドバー＋スマホ下部ナビ
- [x] 認証・権限：OIDC（PKCE・state・nonce）、JWE セッション、RBAC（member / manager / admin）、本番 fail-closed（開発ログイン拒否・社内ドメイン必須）
- [x] データ：Prisma 7 + PostgreSQL、Netlify Database 用マイグレーション（スキーマ＋台帳の初期データ）
- [x] テスト（ローカル）：Vitest 61、PostgreSQL 16 で 7（契約＋マイグレーション適用）、Playwright 10（PC 9・スマホ 1）、型チェック、本番ビルド
- [x] 新規独立リポジトリ `hasegawa212/-artial-rts`（既存リポジトリには何もコミットしていない）、draft PR #1

## B：完成に必須（残り）
- [ ] GitHub 上の CI（`.github/workflows/ci.yml`）が通ること
- [ ] Google OAuth クライアントの作成と `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` の設定（利用者の作業）
- [ ] `ALLOWED_EMAIL_DOMAINS` / `ADMIN_EMAILS` の設定（社内ドメインの確認待ち）
- [ ] Netlify へのデプロイ（作業環境から netlify のホストが遮断中。ネットワーク許可、または Netlify サイトを GitHub リポジトリに接続して main へのマージで自動デプロイ）
- [ ] 本番で Google ログイン → ホーム → アプリを開く → 管理者画面 を一通り確認（実 IdP でのログインは未検証）

## C：次回アップデート（バックログ）
- 稼働確認済み URL が 0 件。公開後、管理者画面で 1 件ずつ「稼働確認済み」にする
- 各アプリの管理者・一部の認証方式、未アクセスの 3 リポジトリ（ma-customer-management / fp / Chat-Bridge）の確認。Supabase に `ma-customer-management` プロジェクト（停止中）があることは確認済み
- 管理者画面からのアプリ追加・編集（現在は URL 確認状況の変更のみ。台帳の変更は新しいマイグレーション SQL で）
- CSP のスクリプトを nonce 方式にして `'unsafe-inline'` を外す
- 実機 Safari での確認（今は Playwright の Chromium エミュレーションのみ）
