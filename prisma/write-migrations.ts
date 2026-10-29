// netlify/database/migrations の 2 本（スキーマ・台帳の初期データ）を書き出す。
// 一度デプロイで適用されたら中身を変えない（Netlify が改ざんとして拒否する）。変更は新しいマイグレーションで足す。
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { APPS } from "../src/domain/catalog";
import { catalogSeedSql } from "./seed-sql";

const DIR = "netlify/database/migrations";
const INIT = `${DIR}/20261029000000_init`;
const SEED = `${DIR}/20261029000100_seed_catalog`;

for (const d of [INIT, SEED]) mkdirSync(d, { recursive: true });
if (!existsSync(`${INIT}/migration.sql`) || process.argv.includes("--force-init")) {
  const sql = execFileSync("npx", ["prisma", "migrate", "diff", "--from-empty", "--to-schema", "prisma/schema.prisma", "--script"], {
    encoding: "utf8",
  });
  writeFileSync(`${INIT}/migration.sql`, sql);
}
writeFileSync(`${SEED}/migration.sql`, catalogSeedSql(APPS));
console.log("wrote", INIT, SEED);
