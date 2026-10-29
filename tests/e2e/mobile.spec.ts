import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("スマホ：ボトムナビ・横スクロールなし・検索ボタン", async ({ page }) => {
  await loginAs(page, "member");
  const nav = page.getByRole("navigation", { name: "メイン（スマホ）" });
  await expect(nav).toBeVisible();
  await expect(page.getByRole("navigation", { name: "メイン", exact: true })).toBeHidden();
  for (const path of ["/", "/apps", "/profile", "/apps/life-housing-sim"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
  await nav.getByRole("button", { name: "アプリを検索" }).click();
  await expect(page.getByRole("dialog", { name: "アプリを検索" })).toBeVisible();
  await page.getByRole("combobox").fill("施工");
  await expect(page.getByRole("option")).toHaveCount(2);
  const box = await nav.getByRole("link", { name: "アプリ" }).boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});
