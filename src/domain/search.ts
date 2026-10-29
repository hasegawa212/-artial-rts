import type { AppEntry } from "./types";
import { categoryLabel } from "./categories";

/** 全角/半角・大小・ひらがな/カタカナ・空白・長音・中黒を畳んで比較する。 */
export function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .replace(/[\sー‐-―\-・･_/]/g, "");
}

type Searchable = Pick<AppEntry, "name" | "kana" | "description" | "keywords" | "category">;

function tokenScore(app: Searchable, t: string): number {
  const name = normalize(app.name);
  if (name.startsWith(t)) return 100;
  if (name.includes(t)) return 60;
  if (normalize(app.kana).includes(t)) return 50;
  if (app.keywords.some((k) => normalize(k).includes(t))) return 40;
  if (normalize(app.description).includes(t)) return 20;
  if (normalize(categoryLabel(app.category)).includes(t)) return 15;
  return 0;
}

export function searchApps<T extends Searchable>(apps: readonly T[], query: string): T[] {
  const tokens = query.split(/\s+/).map(normalize).filter(Boolean);
  if (tokens.length === 0) return [...apps];
  const scored: { app: T; score: number; i: number }[] = [];
  apps.forEach((app, i) => {
    let score = 0;
    for (const t of tokens) {
      const s = tokenScore(app, t);
      if (s === 0) return;
      score += s;
    }
    scored.push({ app, score, i });
  });
  return scored.sort((a, b) => b.score - a.score || a.i - b.i).map((x) => x.app);
}
