import { expect, test } from "@playwright/test";

// ホーム画面に追加したときのアイコン。ログイン画面で追加されることもあるので、未ログインでも取れること。
test("ホーム画面アイコン・manifest は未ログインでも取得できる", async ({ page, request }) => {
  const apple = await request.get("/apple-icon.png", { maxRedirects: 0 });
  expect(apple.status()).toBe(200);
  expect(apple.headers()["content-type"]).toContain("image/png");

  const manifest = await request.get("/manifest.webmanifest", { maxRedirects: 0 });
  expect(manifest.status()).toBe(200);
  const m = await manifest.json();
  expect(m.name).toBe("MARTIAL ARTS ONE");
  expect(m.display).toBe("standalone");
  for (const icon of m.icons as { src: string; sizes: string }[]) {
    const r = await request.get(icon.src, { maxRedirects: 0 });
    expect(r.status(), icon.src).toBe(200);
    expect(r.headers()["content-type"], icon.src).toContain("image/png");
  }
  expect((m.icons as { sizes: string }[]).map((i) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));

  await page.goto("/login");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", /apple-icon/);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute("content", "MA ONE");
});
