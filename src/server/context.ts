import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { can, type Permission } from "@/domain/rbac";
import type { PortalUser } from "@/domain/types";
import { env } from "./env";
import { MemoryRepo } from "./repo/memory";
import { createPrismaClient, PrismaRepo } from "./repo/prisma";
import type { PortalRepo } from "./repo/types";
import { openSession, SESSION_COOKIE } from "./session";

const g = globalThis as unknown as { __maoRepo?: PortalRepo };

/** DATABASE_URL があれば PostgreSQL、なければ（本番以外のみ）メモリ。 */
export function repo(): PortalRepo {
  if (g.__maoRepo) return g.__maoRepo;
  const e = env();
  g.__maoRepo = e.DATABASE_URL ? new PrismaRepo(createPrismaClient(e.DATABASE_URL)) : new MemoryRepo();
  return g.__maoRepo;
}

/**
 * 現在の利用者。ロールは毎回 DB の値を使う（管理者が下げたロールは次の画面から効く）。
 * DB に居ない利用者のセッションは無効として扱う。
 */
export async function currentUser(): Promise<PortalUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await openSession(token, env().SESSION_SECRET);
  if (!s) return null;
  const stored = (await repo().listUsers()).find((u) => u.sub === s.sub);
  return stored ? { sub: stored.sub, email: stored.email, name: stored.name, role: stored.role } : null;
}

export async function requireUser(perm: Permission = "app:view"): Promise<PortalUser> {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (!can(u, perm)) redirect("/?denied=1");
  return u;
}
