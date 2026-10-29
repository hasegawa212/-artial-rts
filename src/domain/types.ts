export type Role = "member" | "manager" | "admin";

export type CategoryId = "sales" | "customer" | "proposal" | "finance" | "org" | "line" | "ai";

/**
 * verified   … 管理者が稼働を確認済み
 * documented … リポジトリのデプロイ設定・README に記載がある（稼働は未確認）
 * unknown    … URL 未確認。リンクは出さない（推測で接続しない）
 */
export type UrlStatus = "verified" | "documented" | "unknown";

export type Lifecycle = "production" | "beta" | "development" | "local" | "frozen";

/** 起動先アプリ自身の認証方式。ポータルはこれを迂回しない（リンクで開くだけ）。 */
export type AuthKind = "oauth" | "own-login" | "password" | "public" | "line" | "chat" | "unknown";

export interface AppEntry {
  id: string;
  name: string;
  /** 検索用のよみ（ひらがな） */
  kana: string;
  description: string;
  category: CategoryId;
  keywords: string[];
  /** owner/repo（未アクセスのものは名前だけ） */
  repo: string;
  /** リポジトリ内のパス */
  path?: string;
  url: string | null;
  urlStatus: UrlStatus;
  /** URL の出典（ファイル名など） */
  urlSource?: string;
  auth: AuthKind;
  authNote: string;
  owner: string;
  lifecycle: Lifecycle;
  /** 閲覧に必要な最低ロール */
  visibility: Role;
  /** 社外秘・人事情報など */
  confidential: boolean;
  /** lucide アイコン名（components/AppIcon の対応表） */
  icon: string;
}

export interface PortalUser {
  sub: string;
  email: string;
  name: string;
  role: Role;
}
