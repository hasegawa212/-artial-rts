import { describe, expect, it } from "vitest";
import { toggleFavorite, recordRecent, RECENT_MAX } from "@/domain/preferences";

describe("favorites", () => {
  it("adds then removes, without mutating the input", () => {
    const a: string[] = ["x"];
    const b = toggleFavorite(a, "y");
    expect(b).toEqual(["x", "y"]);
    expect(a).toEqual(["x"]);
    expect(toggleFavorite(b, "x")).toEqual(["y"]);
  });
});

describe("recent", () => {
  it("puts the latest first and de-duplicates", () => {
    expect(recordRecent(["a", "b", "c"], "b")).toEqual(["b", "a", "c"]);
  });
  it("caps the list", () => {
    const many = Array.from({ length: RECENT_MAX }, (_, i) => `a${i}`);
    const out = recordRecent(many, "new");
    expect(out).toHaveLength(RECENT_MAX);
    expect(out[0]).toBe("new");
    expect(out).not.toContain(`a${RECENT_MAX - 1}`);
  });
});
