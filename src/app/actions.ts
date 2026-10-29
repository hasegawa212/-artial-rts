"use server";

import { revalidatePath } from "next/cache";
import { can, canSeeApp, isRole } from "@/domain/rbac";
import type { UrlStatus } from "@/domain/types";
import { currentUser, repo } from "@/server/context";

// Server Actions は Next.js が Origin を検査する。ここでは必ず権限を確かめ直す。

export async function toggleFavoriteAction(appId: string): Promise<boolean> {
  const u = await currentUser();
  if (!u) throw new Error("unauthorized");
  const app = await repo().getApp(appId);
  if (!app || !canSeeApp(u, app)) throw new Error("forbidden");
  const on = await repo().toggleFavorite(u.sub, appId);
  revalidatePath("/", "layout");
  return on;
}

export async function setUserRoleAction(sub: string, role: string): Promise<void> {
  const u = await currentUser();
  if (!can(u, "admin:users:edit") || !isRole(role)) throw new Error("forbidden");
  if (sub === u!.sub && role !== "admin") throw new Error("自分自身の管理者権限は外せません");
  await repo().setUserRole(sub, role);
  await repo().audit({ actor: u!.sub, action: "user.role", target: sub, detail: role });
  revalidatePath("/admin");
}

const URL_STATUSES: UrlStatus[] = ["verified", "documented", "unknown"];

export async function setUrlStatusAction(appId: string, status: string): Promise<void> {
  const u = await currentUser();
  if (!can(u, "admin:apps:edit") || !URL_STATUSES.includes(status as UrlStatus)) throw new Error("forbidden");
  const app = await repo().getApp(appId);
  if (!app) throw new Error("not found");
  // URL の無いアプリを「確認済み」にはできない（推測で接続しない）
  if (status !== "unknown" && !app.url) throw new Error("URL が登録されていません");
  await repo().setAppUrlStatus(appId, status as UrlStatus);
  await repo().audit({ actor: u!.sub, action: "app.urlStatus", target: appId, detail: status });
  revalidatePath("/", "layout");
}
