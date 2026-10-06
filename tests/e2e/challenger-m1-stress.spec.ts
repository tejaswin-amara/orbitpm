import { expect, test } from "@playwright/test";
import { assertZeroBodyScroll, assertZeroHorizontalOverflow } from "./helpers/viewport";

const DESKTOP_VIEWPORTS = [
  { name: "1080p Standard Desktop", width: 1920, height: 1080 },
  { name: "1440p Widescreen Desktop", width: 2560, height: 1440 },
  { name: "4K Ultra-HD Desktop", width: 3840, height: 2160 },
  { name: "720p Laptop Desktop", width: 1366, height: 768 },
  { name: "1024x768 Legacy Landscape", width: 1024, height: 768 },
];

const RESPONSIVE_VIEWPORTS = [
  { name: "Tablet Portrait (iPad)", width: 768, height: 1024 },
  { name: "Mobile (iPhone 12/13/14)", width: 390, height: 844 },
  { name: "Compact Mobile (Android)", width: 360, height: 640 },
];

const PUBLIC_ROUTES = [
  { name: "Landing (/) ", path: "/" },
  { name: "Sign-In (/sign-in)", path: "/sign-in" },
  { name: "Sign-Up (/sign-up)", path: "/sign-up" },
];

test.describe("Challenger Stress Suite 1: Desktop Zero-Scroll Invariant Matrix", () => {
  for (const vp of DESKTOP_VIEWPORTS) {
    for (const route of PUBLIC_ROUTES) {
      test(`${route.name} strictly satisfies 0px scroll displacement & scrollHeight == innerHeight at ${vp.name} (${vp.width}x${vp.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const res = await page.goto(route.path);
        expect(res?.status()).toBe(200);

        // 1. Zero body scroll metric check & mouse wheel resistance
        const metrics = await assertZeroBodyScroll(page, {
          label: `${vp.name} on ${route.path}`,
          checkWheelResistance: true,
          tolerancePx: 0,
        });

        // 2. Strict scrollHeight equals innerHeight invariant
        expect(
          metrics.scrollHeight,
          `[${vp.name} on ${route.path}] Document scrollHeight must equal windowInnerHeight (${vp.height}px)`,
        ).toBe(vp.height);

        // 3. Document scrollWidth must equal windowInnerWidth
        expect(
          metrics.scrollWidth,
          `[${vp.name} on ${route.path}] Document scrollWidth must equal windowInnerWidth (${vp.width}px)`,
        ).toBe(vp.width);

        // 4. Keyboard scroll resistance test (PageDown, ArrowDown, Spacebar, End)
        await page.keyboard.press("PageDown");
        await page.waitForTimeout(50);
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(50);
        await page.keyboard.press("Space");
        await page.waitForTimeout(50);
        await page.keyboard.press("End");
        await page.waitForTimeout(50);

        const scrollYAfterKeyboard = await page.evaluate(() => window.scrollY);
        expect(
          scrollYAfterKeyboard,
          `[${vp.name} on ${route.path}] Keyboard actions caused window scroll displacement! Expected 0, received ${scrollYAfterKeyboard}`,
        ).toBe(0);

        // 5. Zero horizontal overflow
        await assertZeroHorizontalOverflow(page, {
          label: `${vp.name} on ${route.path}`,
          tolerancePx: 0,
        });
      });
    }
  }
});

test.describe("Challenger Stress Suite 2: Responsive Viewport Zero Horizontal Overflow Matrix", () => {
  for (const vp of RESPONSIVE_VIEWPORTS) {
    for (const route of PUBLIC_ROUTES) {
      test(`${route.name} strictly maintains zero horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const res = await page.goto(route.path);
        expect(res?.status()).toBe(200);

        // Assert 0px horizontal overflow
        const overflowMetrics = await assertZeroHorizontalOverflow(page, {
          label: `${vp.name} on ${route.path}`,
          tolerancePx: 0,
        });

        expect(
          overflowMetrics.horizontalOverflowPx,
          `[${vp.name} on ${route.path}] Horizontal overflow detected!`,
        ).toBe(0);

        // Assert window.scrollX remains 0 even after horizontal wheel attempt
        await page.mouse.wheel(200, 0);
        await page.waitForTimeout(50);
        const scrollXAfter = await page.evaluate(() => window.scrollX);
        expect(
          scrollXAfter,
          `[${vp.name} on ${route.path}] Horizontal scroll occurred! scrollX=${scrollXAfter}`,
        ).toBe(0);
      });
    }
  }
});

test.describe("Challenger Stress Suite 3: High-Stress Adversarial Scenarios", () => {
  test("Rapid dynamic viewport cycling across extreme boundaries", async ({ page }) => {
    await page.goto("/");

    const cycleSequence = [
      { width: 3840, height: 2160, isDesktop: true, name: "4K" },
      { width: 390, height: 844, isDesktop: false, name: "Mobile" },
      { width: 1366, height: 768, isDesktop: true, name: "720p Laptop" },
      { width: 768, height: 1024, isDesktop: false, name: "Tablet Portrait" },
      { width: 2560, height: 1440, isDesktop: true, name: "1440p Widescreen" },
      { width: 360, height: 640, isDesktop: false, name: "Compact Mobile" },
      { width: 1920, height: 1080, isDesktop: true, name: "1080p Standard" },
    ];

    for (const step of cycleSequence) {
      await page.setViewportSize({ width: step.width, height: step.height });
      await page.waitForTimeout(100);

      // Verify zero horizontal overflow on all viewports
      await assertZeroHorizontalOverflow(page, {
        label: `Rapid cycle step ${step.name}`,
        tolerancePx: 0,
      });

      // If desktop, verify strict zero body scroll
      if (step.isDesktop) {
        await assertZeroBodyScroll(page, {
          label: `Rapid cycle desktop step ${step.name}`,
          checkWheelResistance: true,
          tolerancePx: 0,
        });
      }
    }
  });

  test("Aggressive mouse wheel flood stress test at 1080p and 4K", async ({ page }) => {
    for (const vp of [
      { width: 1920, height: 1080, name: "1080p" },
      { width: 3840, height: 2160, name: "4K" },
    ]) {
      await page.setViewportSize(vp);
      await page.goto("/");

      // Fire 10 rapid mouse wheel pulses of 500px down each
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 500);
      }
      await page.waitForTimeout(150);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY, `[${vp.name}] Mouse wheel flood broke scroll lock! scrollY=${scrollY}`).toBe(
        0,
      );

      // Try negative (upward) wheel pulses
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, -300);
      }
      await page.waitForTimeout(100);

      const scrollYUp = await page.evaluate(() => window.scrollY);
      expect(
        scrollYUp,
        `[${vp.name}] Upward mouse wheel broke scroll lock! scrollY=${scrollYUp}`,
      ).toBe(0);
    }
  });

  test("Critical element visibility and non-occlusion across all desktop viewports", async ({
    page,
  }) => {
    for (const vp of DESKTOP_VIEWPORTS) {
      await page.setViewportSize(vp);
      await page.goto("/");

      // Nav elements must be visible and within bounds
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();

      // CTA button must be clickable
      const cta = page.getByRole("link", { name: "Get started" });
      await expect(cta).toBeVisible();

      // Sign-in link
      const signInLink = page.getByRole("link", { name: "Sign in" });
      await expect(signInLink).toBeVisible();

      // Footer
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();

      // Verify footer is within viewport
      const footerBox = await footer.boundingBox();
      expect(footerBox).not.toBeNull();
      if (footerBox) {
        expect(
          footerBox.y + footerBox.height,
          `[${vp.name}] Footer exceeds viewport height!`,
        ).toBeLessThanOrEqual(vp.height + 1);
        expect(footerBox.y, `[${vp.name}] Footer top is above 0!`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("Device scale factor (1.5x, 2.0x HiDPI) does not induce scroll overflow", async ({
    browser,
  }) => {
    for (const scale of [1.5, 2.0]) {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: scale,
      });
      const page = await context.newPage();

      try {
        await page.goto("/");
        await assertZeroBodyScroll(page, {
          label: `HiDPI ${scale}x 1080p Landing`,
          tolerancePx: 0,
        });

        await page.goto("/sign-in");
        await assertZeroBodyScroll(page, {
          label: `HiDPI ${scale}x 1080p Sign-In`,
          tolerancePx: 0,
        });
      } finally {
        await context.close();
      }
    }
  });
});
