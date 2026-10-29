import { APPS } from "@/domain/catalog";
import { recordRecent, toggleFavorite } from "@/domain/preferences";
import type { AppEntry, PortalUser, Role, UrlStatus } from "@/domain/types";
import { mergeRole, type AuditEvent, type AuditRecord, type PortalRepo, type Prefs, type StoredUser } from "./types";

/** 開発・テスト用。プロセスが落ちると消える（本番では使わない）。 */
export class MemoryRepo implements PortalRepo {
  private apps = new Map<string, AppEntry>(APPS.map((a) => [a.id, structuredClone(a)]));
  private users = new Map<string, StoredUser>();
  private prefs = new Map<string, Prefs>();
  private log: AuditRecord[] = [];
  private seq = 0;

  async listApps() {
    return [...this.apps.values()].map((a) => structuredClone(a));
  }
  async getApp(id: string) {
    const a = this.apps.get(id);
    return a ? structuredClone(a) : null;
  }
  async setAppUrlStatus(id: string, status: UrlStatus) {
    const a = this.apps.get(id);
    if (a) a.urlStatus = status;
  }
  async upsertUser(u: PortalUser) {
    const prev = this.users.get(u.sub);
    const next: StoredUser = { ...u, role: mergeRole(u.role, prev?.role), lastLoginAt: new Date() };
    this.users.set(u.sub, next);
    return { ...next };
  }
  async listUsers() {
    return [...this.users.values()].map((u) => ({ ...u }));
  }
  async setUserRole(sub: string, role: Role) {
    const u = this.users.get(sub);
    if (u) u.role = role;
  }
  private p(sub: string): Prefs {
    return this.prefs.get(sub) ?? { favorites: [], recent: [] };
  }
  async getPrefs(sub: string) {
    const p = this.p(sub);
    return { favorites: [...p.favorites], recent: [...p.recent] };
  }
  async toggleFavorite(sub: string, appId: string) {
    const p = this.p(sub);
    const favorites = toggleFavorite(p.favorites, appId);
    this.prefs.set(sub, { ...p, favorites });
    return favorites.includes(appId);
  }
  async recordUse(sub: string, appId: string) {
    const p = this.p(sub);
    this.prefs.set(sub, { ...p, recent: recordRecent(p.recent, appId) });
  }
  async audit(e: AuditEvent) {
    this.log.unshift({ ...e, id: String(++this.seq), at: new Date() });
  }
  async listAudit(limit: number) {
    return this.log.slice(0, limit).map((e) => ({ ...e }));
  }
}
