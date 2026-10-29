// 台帳の初期データ（src/domain/catalog.ts）を DB へ入れる。
// 既存行は「台帳の元データ」部分だけ更新し、管理者が付けた urlStatus は残す。
import { APPS, validateCatalog } from "../src/domain/catalog";
import { createPrismaClient } from "../src/server/repo/prisma";

export async function seed(databaseUrl: string) {
  const errors = validateCatalog(APPS);
  if (errors.length) throw new Error("catalog invalid: " + errors.join("; "));
  const db = createPrismaClient(databaseUrl);
  try {
    for (const [i, a] of APPS.entries()) {
      const data = {
        name: a.name,
        kana: a.kana,
        description: a.description,
        category: a.category,
        keywords: a.keywords,
        repo: a.repo,
        path: a.path ?? null,
        url: a.url,
        urlSource: a.urlSource ?? null,
        auth: a.auth,
        authNote: a.authNote,
        owner: a.owner,
        lifecycle: a.lifecycle,
        visibility: a.visibility,
        confidential: a.confidential,
        icon: a.icon,
        sortOrder: i,
      };
      await db.app.upsert({ where: { id: a.id }, create: { id: a.id, urlStatus: a.urlStatus, ...data }, update: data });
    }
  } finally {
    await db.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  await seed(url);
  console.log(`seeded ${APPS.length} apps`);
}
