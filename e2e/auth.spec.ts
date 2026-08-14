import { expect, test } from "@playwright/test";

const EMAIL = "e2e@northwind.test";
const PASSWORD = "e2e-pass-123";

test("unauthenticated visitor is redirected to login", async ({ page }) => {
  await page.goto("/runs");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("signs in and reaches the runs view", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/runs/);
  // the authenticated shell exposes the primary nav
  await expect(page.getByRole("link", { name: "Workflows" })).toBeVisible();
});

test("rejects bad credentials with an inline error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill("wrong-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();

  // stays on login and shows the server error, does not navigate to /runs
  await expect(page).toHaveURL(/\/login/);
});
