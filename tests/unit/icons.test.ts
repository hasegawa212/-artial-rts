import { describe, expect, it } from "vitest";
import { APPS, CATEGORIES } from "@/domain/catalog";
import { KNOWN_ICONS } from "@/components/AppIcon";

describe("icons", () => {
  it("every app and category icon has a real lucide icon (no silent fallback)", () => {
    for (const x of [...APPS, ...CATEGORIES]) expect(KNOWN_ICONS, x.id).toContain(x.icon);
  });
});
