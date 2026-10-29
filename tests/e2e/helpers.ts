import { expect, type Page } from "@playwright/test";

export async function loginAs(page: Page, role: "member" | "manager" | "admin") {
  await page.goto("/login");
  const label = { member: "メンバー", manager: "マネージャー", admin: "管理者" }[role];
  await page.getByRole("button", { name: `${label}としてログイン` }).click();
  await expect(page).toHaveURL(/\/$/);
}
