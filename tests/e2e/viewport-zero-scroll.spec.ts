import { expect, test } from "@playwright/test";
import {
  assertSpatialContainment,
  assertZeroBodyScroll,
  assertZeroHorizontalOverflow,
} from "./helpers/viewport";

test.describe("Tier 1: Smoke & Static Viewport Sanity", () => {
  test("landing page (/) renders primary brand identity, navigation, and hero CTA", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Brand and primary navigation
    await expect(page.getByRole("link", { name: "OrbitPM" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();

    // Hero content
    await expect(
      page.getByRole("heading", { name: /project management without the infrastructure tax/i }),
    ).toBeVisible();

    // Feature highlights
    await expect(page.getByRole("heading", { name: /projects that stay legible/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /authorization by default/i })).toBeVisible();

    // Footer landmark
    await expect(page.getByText("OrbitPM · 2026")).toBeVisible();
  });

  test("sign-in page (/sign-in) renders centered auth card and interactive form", async ({
    page,
  }) => {
    const response = await page.goto("/sign-in");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create one/i })).toBeVisible();
  });

  test("sign-up page (/sign-up) renders centered auth card and interactive form", async ({
    page,
  }) => {
    const response = await page.goto("/sign-up");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });
});

test.describe("Tier 2: 1080p Standard Desktop Viewport (1920x1080)", () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test("sign-in page satisfies strict zero-scroll invariant at 1080p", async ({ page }) => {
    await page.goto("/sign-in");

    // Zero body scroll assertion
    await assertZeroBodyScroll(page, {
      label: "1080p Sign-In Page",
      checkWheelResistance: true,
    });

    // Spatial containment of auth shell within 1080p bounds
    await assertSpatialContainment(page, "main", {
      label: "1080p Sign-In Main Container",
    });
  });

  test("sign-up page satisfies strict zero-scroll invariant at 1080p", async ({ page }) => {
    await page.goto("/sign-up");

    // Zero body scroll assertion
    await assertZeroBodyScroll(page, {
      label: "1080p Sign-Up Page",
      checkWheelResistance: true,
    });

    // Spatial containment of auth shell within 1080p bounds
    await assertSpatialContainment(page, "main", {
      label: "1080p Sign-Up Main Container",
    });
  });

  test("landing page satisfies strict zero-scroll invariant at 1080p", async ({ page }) => {
    await page.goto("/");

    // Fixed navigation bar spatial containment
    await assertSpatialContainment(page, "nav", {
      label: "1080p Landing Nav",
    });

    // Zero body scroll assertion per R1 specification
    await assertZeroBodyScroll(page, {
      label: "1080p Landing Page",
      checkWheelResistance: true,
    });
  });
});

test.describe("Tier 2: 1440p Widescreen Desktop Viewport (2560x1440)", () => {
  test.use({ viewport: { width: 2560, height: 1440 } });

  test("landing page satisfies zero-scroll invariant at 1440p", async ({ page }) => {
    await page.goto("/");

    await assertZeroBodyScroll(page, {
      label: "1440p Landing Page",
      checkWheelResistance: true,
    });

    await assertSpatialContainment(page, "nav", {
      label: "1440p Landing Nav",
    });
  });

  test("sign-in page satisfies zero-scroll invariant at 1440p", async ({ page }) => {
    await page.goto("/sign-in");

    await assertZeroBodyScroll(page, {
      label: "1440p Sign-In Page",
      checkWheelResistance: true,
    });

    await assertSpatialContainment(page, "main", {
      label: "1440p Sign-In Main Container",
    });
  });

  test("sign-up page satisfies zero-scroll invariant at 1440p", async ({ page }) => {
    await page.goto("/sign-up");

    await assertZeroBodyScroll(page, {
      label: "1440p Sign-Up Page",
      checkWheelResistance: true,
    });

    await assertSpatialContainment(page, "main", {
      label: "1440p Sign-Up Main Container",
    });
  });
});

test.describe("Tier 2: Mobile Responsive Viewport (390x844)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("landing page maintains zero horizontal overflow on mobile", async ({ page }) => {
    await page.goto("/");

    await assertZeroHorizontalOverflow(page, {
      label: "Mobile 390x844 Landing Page",
    });
  });

  test("sign-in page maintains zero horizontal overflow and readable form on mobile", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    await assertZeroHorizontalOverflow(page, {
      label: "Mobile 390x844 Sign-In Page",
    });

    await assertSpatialContainment(page, "main", {
      label: "Mobile 390x844 Sign-In Form Container",
    });
  });

  test("sign-up page maintains zero horizontal overflow and readable form on mobile", async ({
    page,
  }) => {
    await page.goto("/sign-up");

    await assertZeroHorizontalOverflow(page, {
      label: "Mobile 390x844 Sign-Up Page",
    });

    await assertSpatialContainment(page, "main", {
      label: "Mobile 390x844 Sign-Up Form Container",
    });
  });
});

test.describe("Tier 2: Compact Mobile Viewport (360x640)", () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test("auth pages maintain zero horizontal overflow on compact mobile (360x640)", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await assertZeroHorizontalOverflow(page, {
      label: "Compact Mobile Sign-In",
    });

    await page.goto("/sign-up");
    await assertZeroHorizontalOverflow(page, {
      label: "Compact Mobile Sign-Up",
    });
  });
});

test.describe("Tier 2 / Adversarial: Viewport Resizing Dynamics", () => {
  test("dynamic viewport resize from mobile to 1080p preserves layout containment", async ({
    page,
  }) => {
    // Start at mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sign-in");

    await assertZeroHorizontalOverflow(page, {
      label: "Pre-resize Mobile Sign-In",
    });

    // Dynamically expand to 1080p desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(100);

    await assertZeroBodyScroll(page, {
      label: "Post-resize 1080p Sign-In",
      checkWheelResistance: true,
    });
  });
});
