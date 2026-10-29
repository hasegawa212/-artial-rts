import { describe, expect, it } from "vitest";
import { APPS, CATEGORIES, validateCatalog, visibleApps, appsByCategory } from "@/domain/catalog";

describe("catalog seed (STEP 1 調査結果)", () => {
  it("passes validation", () => {
    expect(validateCatalog(APPS)).toEqual([]);
  });

  it("covers the repositories named in the brief, recording inaccessible ones as 未確認", () => {
    const repos = new Set(APPS.map((a) => a.repo));
    for (const r of ["hasegawa212/-", "hasegawa212/kaitsuke-report", "hasegawa212/-6780"]) expect(repos.has(r)).toBe(true);
    for (const r of ["ma-customer-management", "fp", "Chat-Bridge"]) {
      const a = APPS.find((x) => x.repo.endsWith(r));
      expect(a, r).toBeDefined();
      expect(a!.urlStatus).toBe("unknown");
      expect(a!.url).toBeNull();
    }
  });

  it("never marks a URL verified (this environment could not reach any of them)", () => {
    expect(APPS.filter((a) => a.urlStatus === "verified")).toEqual([]);
  });

  it("every documented URL names the file it came from", () => {
    for (const a of APPS.filter((x) => x.urlStatus === "documented")) expect(a.urlSource, a.id).toMatch(/\S/);
  });

  it("keeps confidential apps away from members", () => {
    for (const a of APPS.filter((x) => x.confidential)) expect(a.visibility, a.id).not.toBe("member");
  });

  it("every app belongs to a defined category", () => {
    const ids = new Set(CATEGORIES.map((c) => c.id));
    for (const a of APPS) expect(ids.has(a.category), a.id).toBe(true);
  });

  it("contains nothing that looks like a secret", () => {
    const blob = JSON.stringify(APPS);
    expect(blob).not.toMatch(/xox[bp]-|sk-ant-|sk-[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}|password=|token=/i);
  });
});

describe("validateCatalog", () => {
  const ok = APPS[0]!;
  it("flags duplicates, insecure URLs and unknown URLs that still carry a link", () => {
    expect(validateCatalog([ok, ok])).toContain(`duplicate id: ${ok.id}`);
    expect(validateCatalog([{ ...ok, url: "http://x", urlStatus: "documented" }]).join()).toMatch(/https/);
    expect(validateCatalog([{ ...ok, url: "https://x", urlStatus: "unknown" }]).join()).toMatch(/unknown/);
    expect(validateCatalog([{ ...ok, url: null, urlStatus: "documented" }]).join()).toMatch(/no url/);
  });
});

describe("visibility helpers", () => {
  it("members see fewer apps than admins and never confidential ones", () => {
    const m = visibleApps(APPS, { role: "member" });
    const a = visibleApps(APPS, { role: "admin" });
    expect(m.length).toBeLessThan(a.length);
    expect(m.some((x) => x.confidential)).toBe(false);
    expect(visibleApps(APPS, null)).toEqual([]);
  });
  it("groups by category in CATEGORIES order, skipping empty ones", () => {
    const g = appsByCategory(APPS);
    const order = CATEGORIES.map((c) => c.id).filter((id) => g.some((x) => x.category.id === id));
    expect(g.map((x) => x.category.id)).toEqual(order);
    expect(g.every((x) => x.apps.length > 0)).toBe(true);
  });
});
