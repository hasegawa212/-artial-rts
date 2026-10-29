// 台帳の初期データ（src/domain/catalog.ts）を Netlify Database のマイグレーション SQL にする。
// 既にある行は触らない（管理者が画面で付けた urlStatus を消さないため）。
import type { AppEntry } from "../src/domain/types";

const str = (v: string | null | undefined) => (v == null ? "NULL" : `'${v.replace(/'/g, "''")}'`);
const arr = (v: string[]) => `ARRAY[${v.map(str).join(", ")}]::text[]`;

const COLUMNS = [
  "id", "name", "kana", "description", "category", "keywords", "repo", "path", "url", "urlStatus", "urlSource",
  "auth", "authNote", "owner", "lifecycle", "visibility", "confidential", "icon", "sortOrder", "updatedAt",
];

export function catalogSeedSql(apps: readonly AppEntry[]): string {
  const rows = apps.map((a, i) =>
    [
      str(a.id), str(a.name), str(a.kana), str(a.description), str(a.category), arr(a.keywords), str(a.repo),
      str(a.path), str(a.url), `${str(a.urlStatus)}::"UrlStatus"`, str(a.urlSource), str(a.auth), str(a.authNote),
      str(a.owner), str(a.lifecycle), `${str(a.visibility)}::"Role"`, a.confidential ? "true" : "false",
      str(a.icon), String(i), "now()",
    ].join(", "),
  );
  return (
    "-- 生成ファイル: npm run db:migrations（prisma/seed-sql.ts）。手で編集しない。\n" +
    `INSERT INTO "App" (${COLUMNS.map((c) => `"${c}"`).join(", ")}) VALUES\n` +
    rows.map((r) => `  (${r})`).join(",\n") +
    '\nON CONFLICT ("id") DO NOTHING;\n'
  );
}
