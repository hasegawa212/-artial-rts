// Shared contract: run against the in-memory repo (unit) and Prisma/PostgreSQL (tests/db).
import { beforeEach, describe, expect, it } from "vitest";
import type { PortalRepo } from "@/server/repo/types";
import { APPS } from "@/domain/catalog";

export function repoContract(name: string, make: () => Promise<PortalRepo>) {
  describe(`PortalRepo contract: ${name}`, () => {
    let repo: PortalRepo;
    beforeEach(async () => {
      repo = await make();
    });

    it("serves the seeded catalog", async () => {
      const apps = await repo.listApps();
      expect(apps.map((a) => a.id).sort()).toEqual(APPS.map((a) => a.id).sort());
      expect(await repo.getApp(APPS[0]!.id)).toMatchObject({ id: APPS[0]!.id, name: APPS[0]!.name });
      expect(await repo.getApp("nope")).toBeNull();
    });

    it("upserts users and keeps the role an admin assigned", async () => {
      await repo.upsertUser({ sub: "s1", email: "a@x", name: "A", role: "member" });
      await repo.setUserRole("s1", "manager");
      const u = await repo.upsertUser({ sub: "s1", email: "a@x", name: "A2", role: "member" });
      expect(u.role).toBe("manager");
      expect(u.name).toBe("A2");
      const configured = await repo.upsertUser({ sub: "s1", email: "a@x", name: "A2", role: "admin" });
      expect(configured.role).toBe("admin"); // ADMIN_EMAILS always wins
      expect((await repo.listUsers()).map((x) => x.sub)).toEqual(["s1"]);
    });

    it("toggles favorites and records recent use per user", async () => {
      const [a, b] = [APPS[0]!.id, APPS[1]!.id];
      await repo.upsertUser({ sub: "s1", email: "a@x", name: "A", role: "member" });
      await repo.upsertUser({ sub: "s2", email: "b@x", name: "B", role: "member" });
      expect(await repo.toggleFavorite("s1", a)).toBe(true);
      expect(await repo.toggleFavorite("s1", b)).toBe(true);
      expect(await repo.toggleFavorite("s1", a)).toBe(false);
      await repo.recordUse("s1", a);
      await repo.recordUse("s1", b);
      await repo.recordUse("s1", a);
      expect(await repo.getPrefs("s1")).toEqual({ favorites: [b], recent: [a, b] });
      expect(await repo.getPrefs("s2")).toEqual({ favorites: [], recent: [] });
    });

    it("appends to the audit log newest first", async () => {
      await repo.audit({ actor: "s1", action: "app.launch", target: "x" });
      await repo.audit({ actor: "s1", action: "user.role", target: "s2", detail: "manager" });
      const log = await repo.listAudit(10);
      expect(log.map((e) => e.action)).toEqual(["user.role", "app.launch"]);
      expect(log[0]!.detail).toBe("manager");
    });

    it("lets an admin change an app's URL status without touching other fields", async () => {
      const id = APPS.find((a) => a.urlStatus === "documented")!.id;
      await repo.setAppUrlStatus(id, "verified");
      const app = await repo.getApp(id);
      expect(app!.urlStatus).toBe("verified");
      expect(app!.url).toBe(APPS.find((a) => a.id === id)!.url);
    });
  });
}
