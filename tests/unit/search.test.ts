import { describe, expect, it } from "vitest";
import { normalize, searchApps } from "@/domain/search";
import type { AppEntry } from "@/domain/types";

const mk = (p: Partial<AppEntry> & Pick<AppEntry, "id" | "name">): AppEntry =>
  ({
    kana: "",
    description: "",
    category: "sales",
    keywords: [],
    visibility: "member",
    ...p,
  }) as AppEntry;

const apps = [
  mk({ id: "cash", name: "資金繰りダッシュボード", kana: "しきんぐり", keywords: ["銀行", "CSV"], category: "finance" }),
  mk({ id: "life", name: "LIFE ROUTE", kana: "らいふるーと", description: "住まいとお金のシミュレーター" }),
  mk({ id: "tac", name: "TAC 自動テレアポ", kana: "たっく", keywords: ["架電"] }),
];

describe("normalize", () => {
  it("folds width, case, hiragana/katakana, spaces and long vowels", () => {
    expect(normalize("ＬＩＦＥ　Route")).toBe(normalize("liferoute"));
    expect(normalize("らいふるーと")).toBe(normalize("ライフルート"));
    expect(normalize("ﾗｲﾌﾙｰﾄ")).toBe(normalize("ライフルート"));
    expect(normalize("ライフ・ルート")).toBe(normalize("ライフルート"));
  });
});

describe("searchApps", () => {
  it("returns every app in original order for an empty query", () => {
    expect(searchApps(apps, "  ").map((a) => a.id)).toEqual(["cash", "life", "tac"]);
  });

  it("matches name, kana reading, keyword, description and category label", () => {
    expect(searchApps(apps, "資金").map((a) => a.id)).toEqual(["cash"]);
    expect(searchApps(apps, "ライフ").map((a) => a.id)).toEqual(["life"]);
    expect(searchApps(apps, "タック").map((a) => a.id)).toEqual(["tac"]);
    expect(searchApps(apps, "架電").map((a) => a.id)).toEqual(["tac"]);
    expect(searchApps(apps, "シミュレーター").map((a) => a.id)).toEqual(["life"]);
    expect(searchApps(apps, "財務").map((a) => a.id)).toEqual(["cash"]);
  });

  it("requires every whitespace-separated token to match", () => {
    expect(searchApps(apps, "life 住まい").map((a) => a.id)).toEqual(["life"]);
    expect(searchApps(apps, "life 銀行")).toEqual([]);
  });

  it("ranks name hits above description hits", () => {
    const list = [
      mk({ id: "d", name: "別のツール", description: "テレアポの記録" }),
      mk({ id: "n", name: "テレアポ管理" }),
    ];
    expect(searchApps(list, "テレアポ").map((a) => a.id)).toEqual(["n", "d"]);
  });
});
