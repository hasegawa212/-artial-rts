import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { RECENT_MAX } from "@/domain/preferences";
import type { AppEntry, PortalUser, Role, UrlStatus } from "@/domain/types";
import { mergeRole, type AuditEvent, type PortalRepo } from "./types";

type AppRow = Awaited<ReturnType<PrismaClient["app"]["findFirstOrThrow"]>>;

function toEntry(r: AppRow): AppEntry {
  return {
    id: r.id,
    name: r.name,
    kana: r.kana,
    description: r.description,
    category: r.category as AppEntry["category"],
    keywords: r.keywords,
    repo: r.repo,
    ...(r.path ? { path: r.path } : {}),
    url: r.url,
    urlStatus: r.urlStatus,
    ...(r.urlSource ? { urlSource: r.urlSource } : {}),
    auth: r.auth as AppEntry["auth"],
    authNote: r.authNote,
    owner: r.owner,
    lifecycle: r.lifecycle as AppEntry["lifecycle"],
    visibility: r.visibility,
    confidential: r.confidential,
    icon: r.icon,
  };
}

export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}

export class PrismaRepo implements PortalRepo {
  constructor(private db: PrismaClient) {}

  async listApps() {
    return (await this.db.app.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] })).map(toEntry);
  }
  async getApp(id: string) {
    const r = await this.db.app.findUnique({ where: { id } });
    return r ? toEntry(r) : null;
  }
  async setAppUrlStatus(id: string, status: UrlStatus) {
    await this.db.app.updateMany({ where: { id }, data: { urlStatus: status } });
  }
  async upsertUser(u: PortalUser) {
    return this.db.$transaction(async (tx) => {
      const prev = await tx.user.findUnique({ where: { sub: u.sub } });
      const role = mergeRole(u.role, prev?.role);
      const now = new Date();
      const r = await tx.user.upsert({
        where: { sub: u.sub },
        create: { sub: u.sub, email: u.email, name: u.name, role, lastLoginAt: now },
        update: { email: u.email, name: u.name, role, lastLoginAt: now },
      });
      return { sub: r.sub, email: r.email, name: r.name, role: r.role, lastLoginAt: r.lastLoginAt };
    });
  }
  async listUsers() {
    const rows = await this.db.user.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({ sub: r.sub, email: r.email, name: r.name, role: r.role, lastLoginAt: r.lastLoginAt }));
  }
  async setUserRole(sub: string, role: Role) {
    await this.db.user.updateMany({ where: { sub }, data: { role } });
  }
  async getPrefs(sub: string) {
    const [fav, uses] = await Promise.all([
      this.db.favorite.findMany({ where: { userSub: sub }, orderBy: { createdAt: "asc" } }),
      this.db.recentUse.findMany({ where: { userSub: sub }, orderBy: { usedAt: "desc" }, take: RECENT_MAX }),
    ]);
    return { favorites: fav.map((f) => f.appId), recent: uses.map((u) => u.appId) };
  }
  async toggleFavorite(sub: string, appId: string) {
    const removed = await this.db.favorite.deleteMany({ where: { userSub: sub, appId } });
    if (removed.count > 0) return false;
    await this.db.favorite.create({ data: { userSub: sub, appId } });
    return true;
  }
  async recordUse(sub: string, appId: string) {
    await this.db.$transaction(async (tx) => {
      await tx.recentUse.upsert({
        where: { userSub_appId: { userSub: sub, appId } },
        create: { userSub: sub, appId, usedAt: new Date() },
        update: { usedAt: new Date() },
      });
      const stale = await tx.recentUse.findMany({ where: { userSub: sub }, orderBy: { usedAt: "desc" }, skip: RECENT_MAX });
      if (stale.length) await tx.recentUse.deleteMany({ where: { userSub: sub, appId: { in: stale.map((s) => s.appId) } } });
    });
  }
  async audit(e: AuditEvent) {
    await this.db.auditLog.create({ data: { actor: e.actor, action: e.action, target: e.target ?? null, detail: e.detail ?? null } });
  }
  async listAudit(limit: number) {
    const rows = await this.db.auditLog.findMany({ orderBy: { id: "desc" }, take: limit });
    return rows.map((r) => ({
      id: String(r.id),
      at: r.at,
      actor: r.actor,
      action: r.action as AuditEvent["action"],
      ...(r.target ? { target: r.target } : {}),
      ...(r.detail ? { detail: r.detail } : {}),
    }));
  }
}
