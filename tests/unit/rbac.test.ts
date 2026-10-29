import { describe, expect, it } from "vitest";
import { can, canSeeApp, ROLES, roleLabel, type Permission } from "@/domain/rbac";
import type { AppEntry } from "@/domain/types";

const app = (visibility: AppEntry["visibility"]) => ({ visibility }) as Pick<AppEntry, "visibility">;

describe("RBAC", () => {
  it("defines exactly three roles, least to most privileged", () => {
    expect(ROLES).toEqual(["member", "manager", "admin"]);
  });

  it("members can view and launch apps but never reach admin", () => {
    const u = { role: "member" as const };
    expect(can(u, "app:view")).toBe(true);
    expect(can(u, "app:launch")).toBe(true);
    for (const p of ["admin:view", "admin:apps:edit", "admin:users:edit", "audit:view"] as Permission[]) {
      expect(can(u, p)).toBe(false);
    }
  });

  it("managers can read the audit log but not edit users or apps", () => {
    const u = { role: "manager" as const };
    expect(can(u, "audit:view")).toBe(true);
    expect(can(u, "admin:view")).toBe(true);
    expect(can(u, "admin:users:edit")).toBe(false);
    expect(can(u, "admin:apps:edit")).toBe(false);
  });

  it("admins hold every permission", () => {
    const u = { role: "admin" as const };
    for (const p of ["app:view", "app:launch", "admin:view", "admin:apps:edit", "admin:users:edit", "audit:view"] as Permission[]) {
      expect(can(u, p)).toBe(true);
    }
  });

  it("is fail-closed for missing users and unknown roles", () => {
    expect(can(null, "app:view")).toBe(false);
    expect(can(undefined, "app:view")).toBe(false);
    expect(can({ role: "root" as never }, "app:view")).toBe(false);
    expect(canSeeApp({ role: "superuser" as never }, app("member"))).toBe(false);
  });

  it("hides apps above the user's role", () => {
    expect(canSeeApp({ role: "member" }, app("member"))).toBe(true);
    expect(canSeeApp({ role: "member" }, app("manager"))).toBe(false);
    expect(canSeeApp({ role: "manager" }, app("manager"))).toBe(true);
    expect(canSeeApp({ role: "manager" }, app("admin"))).toBe(false);
    expect(canSeeApp({ role: "admin" }, app("admin"))).toBe(true);
    expect(canSeeApp(null, app("member"))).toBe(false);
  });

  it("labels roles in Japanese", () => {
    expect(roleLabel("admin")).toBe("管理者");
    expect(roleLabel("manager")).toBe("マネージャー");
    expect(roleLabel("member")).toBe("メンバー");
  });
});
