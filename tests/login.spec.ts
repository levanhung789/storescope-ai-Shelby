import { test, expect, Page } from "@playwright/test";

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

async function loginDemo(page: Page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.fill(usernameSelector, USERNAME);
  await page.fill(passwordSelector, PASSWORD);
  await page.getByRole("button", { name: submitButtonLabel }).click();
  await expect(page.getByText(successMessage)).toBeVisible();
  await page.waitForURL("**/dashboard", { timeout: 5000 });
  await expect(page.getByText(dashboardHeroText)).toBeVisible();
}

test("demo credentials navigate to dashboard", async ({ page }) => {
  await loginDemo(page);

  // Giữ nguyên trang ~4s để chắc chắn không tự nhảy về trang đăng nhập
  await page.waitForTimeout(4000);
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("switching companies updates product list", async ({ page }) => {
  await loginDemo(page);

  const productTitle = page.getByTestId("product-title").first();
  const ajinomotoFirst = (await productTitle.textContent())?.trim();

  const companySelect = page.locator("select").nth(1);
  await companySelect.selectOption({ label: "Công ty Cổ phần D-SHINING" });

  await expect(
    page.getByText(/Công ty đang chọn: Công ty Cổ phần D-SHINING/i)
  ).toBeVisible();

  await expect(page.getByTestId("product-title").first()).not.toHaveText(ajinomotoFirst ?? "");
});

test("Cong Ty Co Phan Dh Foods shows its catalog", async ({ page }) => {
  await loginDemo(page);

  const companySelect = page.locator("select").nth(1);
  await companySelect.selectOption({ label: "Cong Ty Co Phan Dh Foods" });

  await expect(page.getByTestId("product-title").first()).toContainText(/dh foods/i);
});
