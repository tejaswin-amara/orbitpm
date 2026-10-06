import { expect, test } from "@playwright/test";
import { assertZeroBodyScroll, assertZeroHorizontalOverflow } from "./helpers/viewport";

test.describe("Adversarial Deep Stress: Focus & Keyboard Navigation Scroll Invariance", () => {
  const VIEWPORTS = [
    { name: "1080p Desktop", width: 1920, height: 1080 },
    { name: "1440p Desktop", width: 2560, height: 1440 },
    { name: "4K Desktop", width: 3840, height: 2160 },
    { name: "720p Laptop", width: 1366, height: 768 },
  ];

  const ROUTES = ["/", "/sign-in", "/sign-up"];

  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`Sequential Tab traversal on ${route} at ${vp.name} does not induce window scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);

        // Perform 30 sequential Tab presses through all interactive elements
        for (let i = 0; i < 30; i++) {
          await page.keyboard.press("Tab");
          const scrollY = await page.evaluate(() => window.scrollY);
          const scrollX = await page.evaluate(() => window.scrollX);

          expect(
            scrollY,
            `[${vp.name} on ${route}] Tab step ${i + 1} caused window.scrollY displacement (${scrollY}px)!`,
          ).toBe(0);
          expect(
            scrollX,
            `[${vp.name} on ${route}] Tab step ${i + 1} caused window.scrollX displacement (${scrollX}px)!`,
          ).toBe(0);
        }

        // Shift+Tab back
        for (let i = 0; i < 15; i++) {
          await page.keyboard.press("Shift+Tab");
          const scrollY = await page.evaluate(() => window.scrollY);
          expect(
            scrollY,
            `[${vp.name} on ${route}] Shift+Tab step ${i + 1} caused window.scrollY displacement (${scrollY}px)!`,
          ).toBe(0);
        }
      });
    }
  }
});

test.describe("Adversarial Deep Stress: Extreme Font Scaling (Text Zoom)", () => {
  test("150% font scaling (24px root) preserves zero-scroll at 1080p and 1440p", async ({
    page,
  }) => {
    for (const vp of [
      { width: 1920, height: 1080, name: "1080p" },
      { width: 2560, height: 1440, name: "1440p" },
    ]) {
      await page.setViewportSize(vp);
      await page.goto("/");

      // Inject 150% root font scaling
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "24px";
      });
      await page.waitForTimeout(100);

      // Verify zero body scroll
      await assertZeroBodyScroll(page, {
        label: `${vp.name} 150% Font Scaled Landing`,
        tolerancePx: 0,
        checkWheelResistance: true,
      });

      // Verify zero horizontal overflow
      await assertZeroHorizontalOverflow(page, {
        label: `${vp.name} 150% Font Scaled Landing`,
        tolerancePx: 0,
      });
    }
  });
});

test.describe("Adversarial Deep Stress: Ultra-Narrow Screen Resilience (320x568)", () => {
  test("320px iPhone SE viewport maintains zero horizontal overflow on all routes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    for (const route of ["/", "/sign-in", "/sign-up"]) {
      await page.goto(route);

      const metrics = await assertZeroHorizontalOverflow(page, {
        label: `320px Ultra-Compact on ${route}`,
        tolerancePx: 0,
      });

      expect(metrics.horizontalOverflowPx).toBe(0);

      // Verify horizontal scroll position is pinned at 0
      const scrollX = await page.evaluate(() => window.scrollX);
      expect(scrollX).toBe(0);
    }
  });
});

test.describe("Adversarial Deep Stress: Form Input Flood & Content Injection", () => {
  test("Extreme string length in auth inputs does not break card containment", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/sign-in");

    const hugeEmail = `${"a".repeat(200)}@${"b".repeat(200)}.com`;
    const hugePassword = "x".repeat(500);

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(hugeEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill(hugePassword);

    // Verify zero body scroll persists
    await assertZeroBodyScroll(page, {
      label: "Sign-In with Extreme Content Length",
      tolerancePx: 0,
      checkWheelResistance: true,
    });

    // Verify zero horizontal overflow persists
    await assertZeroHorizontalOverflow(page, {
      label: "Sign-In with Extreme Content Length",
      tolerancePx: 0,
    });
  });
});
