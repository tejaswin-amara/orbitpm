import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page is usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /project management/i })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("sign-up page renders", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.getByRole("heading", { name: /create your workspace/i })).toBeVisible();
});
