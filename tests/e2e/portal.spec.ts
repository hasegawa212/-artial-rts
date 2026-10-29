import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe.configure({ mode: "serial" });

test("未ログインはログイン画面へ、API は 401", async ({ page, request }) => {
  await page.goto("/apps");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  const r = await request.post("/api/apps/life-housing-sim/launch", { maxRedirects: 0 });
  expect(r.status()).toBe(401);
});

test("メンバー：ホーム・カテゴリー・社外秘は見えない・管理者画面は拒否", async ({ page }) => {
  await loginAs(page, "member");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("開発 メンバー さん");
  await expect(page.getByRole("heading", { name: "お気に入り" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "最近使用したアプリ" })).toBeVisible();

  await page.goto("/apps");
  await expect(page.getByRole("link", { name: "LIFE ROUTE（ライフルート）" })).toBeVisible();
  await expect(page.getByText("営業部 1on1・立ち位置分析ボード")).toHaveCount(0);
  await expect(page.getByText("資金繰りダッシュボード")).toHaveCount(0); // manager 以上

  const res = await page.goto("/apps/sales-org-1on1");
  expect(res?.status()).toBe(404);

  await page.goto("/admin");
  await expect(page).toHaveURL(/denied=1/);
  await expect(page.getByRole("alert")).toContainText("権限がありません");
  await expect(page.getByRole("link", { name: "管理者" })).toHaveCount(0);
});

test("全アプリ検索（Ctrl+K）から詳細へ", async ({ page }) => {
  await loginAs(page, "member");
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox");
  await box.fill("らいふ");
  await expect(page.getByRole("option").first()).toContainText("LIFE ROUTE");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/apps\/life-housing-sim$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("LIFE ROUTE（ライフルート）");
  await expect(page.getByText("稼働未確認").first()).toBeVisible();
});

test("お気に入りの追加と解除", async ({ page }) => {
  await loginAs(page, "member");
  await page.goto("/apps/construction-book");
  await page.getByRole("button", { name: "施工記録ブック をお気に入りに追加" }).click();
  await expect(page.getByRole("button", { name: "施工記録ブック をお気に入りから外す" })).toBeVisible();
  await page.goto("/favorites");
  await expect(page.getByRole("link", { name: "施工記録ブック" })).toBeVisible();
  await page.getByRole("button", { name: "施工記録ブック をお気に入りから外す" }).click();
  await page.reload();
  await expect(page.getByText("まだありません")).toBeVisible();
});

test("起動：URL 記載ありは 303 で移動して最近使用に残る／URL 未確認は開けない／他オリジンは 403", async ({ page, baseURL }) => {
  await loginAs(page, "member");
  const ok = await page.request.post("/api/apps/life-housing-sim/launch", { headers: { origin: baseURL! }, maxRedirects: 0 });
  expect(ok.status()).toBe(303);
  expect(ok.headers().location).toBe("https://hasegawa212.github.io/-/life-housing-sim/");

  const cross = await page.request.post("/api/apps/life-housing-sim/launch", { headers: { origin: "https://evil.example" }, maxRedirects: 0 });
  expect(cross.status()).toBe(403);

  const unknown = await page.request.post("/api/apps/echo-interview-console/launch", { headers: { origin: baseURL! }, maxRedirects: 0 });
  expect(unknown.status()).toBe(303);
  expect(unknown.headers().location).toContain("/apps/echo-interview-console?blocked=url-unknown");

  const forbidden = await page.request.post("/api/apps/sales-org-1on1/launch", { headers: { origin: baseURL! }, maxRedirects: 0 });
  expect(forbidden.headers().location).toContain("blocked=forbidden");

  await page.goto("/apps/echo-interview-console");
  await expect(page.getByText("URL未確認のため接続しません")).toBeVisible();
  await expect(page.getByRole("button", { name: "開く" })).toHaveCount(0);

  await page.goto("/");
  await expect(page.locator('section[aria-labelledby="recent-h"]').getByText("LIFE ROUTE（ライフルート）")).toBeVisible();
});

test("マネージャー：管理者画面は閲覧のみ（編集不可）", async ({ page }) => {
  await loginAs(page, "manager");
  await page.goto("/admin");
  await expect(page.getByText("（閲覧のみ）")).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await page.goto("/admin?tab=audit");
  await expect(page.getByRole("cell", { name: "app.launch" }).first()).toBeVisible();
});

test("管理者：URL 確認状況とロールを変更でき、監査ログに残る", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/admin");
  await page.getByRole("combobox", { name: "本物査定アプリ のURL確認状況" }).selectOption("verified");
  await expect(page.getByRole("combobox", { name: "本物査定アプリ のURL確認状況" })).toBeEnabled();
  await page.goto("/apps/appraisal-app");
  await expect(page.getByText("稼働確認済み").first()).toBeVisible();

  // URL が無いアプリは確認済みにできない
  await page.goto("/admin");
  await expect(page.getByRole("combobox", { name: "反響面談コンソール のURL確認状況" })).toBeDisabled();

  await page.goto("/admin?tab=users");
  await page.getByRole("combobox", { name: "開発 メンバー のロール" }).selectOption("manager");
  await expect(page.getByRole("combobox", { name: "開発 管理者 のロール" })).toBeDisabled();

  await page.goto("/admin?tab=audit");
  await expect(page.getByRole("cell", { name: "app.urlStatus" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "user.role" })).toBeVisible();
});

test("ロールの変更は次の画面から効く（再ログイン不要）", async ({ page }) => {
  await loginAs(page, "member"); // 前のテストで manager に変更済み
  await page.goto("/apps");
  await expect(page.getByText("資金繰りダッシュボード")).toBeVisible();
});

test("テーマ切替とログアウト", async ({ page }) => {
  await loginAs(page, "member");
  await page.goto("/profile");
  const main = page.getByRole("main");
  await main.getByRole("radio", { name: "ダーク" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // サイドバーの切替も同じ値になる
  await expect(page.getByRole("complementary").getByRole("radio", { name: "ダーク" })).toHaveAttribute("aria-checked", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await main.getByRole("radio", { name: "ライト" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await main.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
