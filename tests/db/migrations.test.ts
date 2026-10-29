import { readFileSync, readdirSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { APPS } from "@/domain/catalog";
import { createPrismaClient, PrismaRepo } from "@/server/repo/prisma";

// Netlify Database と同じく、空の DB に netlify/database/migrations を順に流して使えることを確かめる。
const url = process.env.DATABASE_URL!;
const DIR = "netlify/database/migrations";
const client = new pg.Client({ connectionString: url });

beforeAll(async () => {
  await client.connect();
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  for (const m of readdirSync(DIR).sort()) await client.query(readFileSync(`${DIR}/${m}/migration.sql`, "utf8"));
});
afterAll(() => client.end());

describe("netlify/database/migrations", () => {
  it("create the schema and seed every app, readable through PrismaRepo", async () => {
    const db = createPrismaClient(url);
    try {
      const apps = await new PrismaRepo(db).listApps();
      expect(apps.map((a) => a.id)).toEqual(APPS.map((a) => a.id));
      expect(apps).toEqual(APPS.map((a) => ({ ...a })));
    } finally {
      await db.$disconnect();
    }
  });

  it("seed is idempotent and keeps an admin-set urlStatus", async () => {
    await client.query(`UPDATE "App" SET "urlStatus" = 'verified' WHERE id = 'appraisal-app'`);
    const seed = readdirSync(DIR).sort().find((d) => d.endsWith("_seed_catalog"))!;
    await client.query(readFileSync(`${DIR}/${seed}/migration.sql`, "utf8"));
    const { rows } = await client.query(`SELECT "urlStatus" FROM "App" WHERE id = 'appraisal-app'`);
    expect(rows[0].urlStatus).toBe("verified");
  });
});
