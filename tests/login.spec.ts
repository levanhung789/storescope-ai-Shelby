import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

const USERNAME = "ADmin123";
const PASSWORD = "888000";

// Helper selectors
const usernameSelector = 'input[type="text"]';
const passwordSelector = 'input[type="password"]';

// Default language is Vietnamese, so button label is "Đăng nhập".
const submitButtonLabel = /đăng nhập/i;

const successMessage = /Đăng nhập thành công/i;

// The dashboard hero text is "Dashboard Quản Trị" (paragraph element).
const dashboardHeroText = /Dashboard Quản Trị/i;

test("demo credentials navigate to dashboard", async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  await page.fill(usernameSelector, USERNAME);
  await page.fill(passwordSelector, PASSWORD);
  await page.getByRole("button", { name: submitButtonLabel }).click();

  await expect(page.getByText(successMessage)).toBeVisible();

  await page.waitForURL("**/dashboard", { timeout: 5000 });

  await expect(page.getByText(dashboardHeroText)).toBeVisible();

  // Giữ nguyên trang ~4s để chắc chắn không tự nhảy về trang đăng nhập
  await page.waitForTimeout(4000);
  await expect(page).toHaveURL(/\/dashboard$/);
});
