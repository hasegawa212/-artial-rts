import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { APPS } from "@/domain/catalog";
import { catalogSeedSql } from "../../prisma/seed-sql";

const DIR = "netlify/database/migrations";

describe("catalog seed migration", () => {
  it("escapes quotes and writes one row per app, keeping admin-set urlStatus on conflict", () => {
    const sql = catalogSeedSql([{ ...APPS[0]!, name: "O'Brien" }]);
    expect(sql).toContain("'O''Brien'");
    expect(sql).toMatch(/ON CONFLICT \("id"\) DO NOTHING/);
  });

  it("the committed migration matches src/domain/catalog.ts (regenerate with npm run db:migrations)", () => {
    const seed = readdirSync(DIR).find((d) => d.endsWith("_seed_catalog"));
    expect(seed).toBeDefined();
    expect(readFileSync(`${DIR}/${seed}/migration.sql`, "utf8")).toBe(catalogSeedSql(APPS));
  });

  it("migrations are ordered by timestamp prefix (schema before seed)", () => {
    const names = readdirSync(DIR).sort();
    expect(names[0]).toMatch(/^\d{14}_init$/);
    expect(names[1]).toMatch(/^\d{14}_seed_catalog$/);
  });
});
