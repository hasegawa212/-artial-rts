import type { AppEntry, PortalUser, Role, UrlStatus } from "@/domain/types";

export interface Prefs {
  favorites: string[];
  recent: string[];
}

export interface AuditEvent {
  actor: string;
  action: "auth.login" | "auth.logout" | "auth.denied" | "app.launch" | "user.role" | "app.urlStatus";
  target?: string;
  detail?: string;
}

export interface AuditRecord extends AuditEvent {
  id: string;
  at: Date;
}

export interface StoredUser extends PortalUser {
  lastLoginAt: Date | null;
}

export interface PortalRepo {
  listApps(): Promise<AppEntry[]>;
  getApp(id: string): Promise<AppEntry | null>;
  setAppUrlStatus(id: string, status: UrlStatus): Promise<void>;
  /**
   * ログイン時に呼ぶ。設定由来のロール（admin / manager）は常に反映し、
   * それ以外は管理者が画面で付けたロールを保つ。
   */
  upsertUser(user: PortalUser): Promise<StoredUser>;
  listUsers(): Promise<StoredUser[]>;
  setUserRole(sub: string, role: Role): Promise<void>;
  getPrefs(sub: string): Promise<Prefs>;
  /** 戻り値: お気に入りに入った = true */
  toggleFavorite(sub: string, appId: string): Promise<boolean>;
  recordUse(sub: string, appId: string): Promise<void>;
  audit(e: AuditEvent): Promise<void>;
  listAudit(limit: number): Promise<AuditRecord[]>;
}

/** 設定由来ロールと保存済みロールのうち強い方。 */
export function mergeRole(configured: Role, stored: Role | undefined): Role {
  const order: Role[] = ["member", "manager", "admin"];
  if (!stored) return configured;
  return order.indexOf(configured) > order.indexOf(stored) ? configured : stored;
}
