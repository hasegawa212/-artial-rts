import type { AppEntry, Role } from "./types";

export const ROLES = ["member", "manager", "admin"] as const satisfies readonly Role[];

export type Permission = "app:view" | "app:launch" | "admin:view" | "admin:apps:edit" | "admin:users:edit" | "audit:view";

const GRANTS: Record<Role, readonly Permission[]> = {
  member: ["app:view", "app:launch"],
  manager: ["app:view", "app:launch", "admin:view", "audit:view"],
  admin: ["app:view", "app:launch", "admin:view", "audit:view", "admin:apps:edit", "admin:users:edit"],
};

const LABELS: Record<Role, string> = { member: "メンバー", manager: "マネージャー", admin: "管理者" };

type WithRole = { role: Role } | null | undefined;

export function isRole(x: unknown): x is Role {
  return typeof x === "string" && (ROLES as readonly string[]).includes(x);
}

function rank(role: unknown): number {
  return isRole(role) ? ROLES.indexOf(role) : -1;
}

export function can(user: WithRole, perm: Permission): boolean {
  if (!user || !isRole(user.role)) return false;
  return GRANTS[user.role].includes(perm);
}

export function canSeeApp(user: WithRole, app: Pick<AppEntry, "visibility">): boolean {
  if (!can(user, "app:view")) return false;
  return rank(user!.role) >= rank(app.visibility);
}

export function roleLabel(role: Role): string {
  return LABELS[role];
}
