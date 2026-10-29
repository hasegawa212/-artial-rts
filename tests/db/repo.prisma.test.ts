import { afterAll } from "vitest";
import { createPrismaClient, PrismaRepo } from "@/server/repo/prisma";
import { seed } from "../../prisma/seed";
import { repoContract } from "../unit/repo.contract";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("tests/db needs DATABASE_URL (a throwaway database — it is wiped)");
const db = createPrismaClient(url);
afterAll(() => db.$disconnect());

repoContract("prisma/postgresql", async () => {
  await db.$executeRawUnsafe('TRUNCATE "Favorite", "RecentUse", "AuditLog", "User", "App" RESTART IDENTITY CASCADE');
  await seed(url);
  return new PrismaRepo(db);
});
