import { expect, type Page } from "@playwright/test";

export interface ViewportScrollMetrics {
  scrollHeight: number;
  clientHeight: number;
  scrollWidth: number;
  clientWidth: number;
  windowInnerHeight: number;
  windowInnerWidth: number;
  verticalOverflowPx: number;
  horizontalOverflowPx: number;
  hasVerticalBodyScroll: boolean;
  hasHorizontalBodyScroll: boolean;
  scrollYAfterWheel?: number;
}

export interface HorizontalOverflowMetrics {
  scrollWidth: number;
  clientWidth: number;
  windowInnerWidth: number;
  horizontalOverflowPx: number;
  culpritElements: string[];
}

export interface SpatialBoundingBox {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export interface SpatialContainmentMetrics {
  elementSelector: string;
  elementBounds: SpatialBoundingBox;
  viewportBounds: { width: number; height: number };
  parentBounds?: SpatialBoundingBox;
  isWithinViewport: boolean;
  isWithinParent?: boolean;
}

/**
 * Asserts that the document body on desktop does not exceed the viewport height or width,
 * verifying the strict 100vh / zero-scroll invariant (R1).
 * Also performs an active mouse-wheel test to ensure wheel events do not scroll the body document.
 */
export async function assertZeroBodyScroll(
  page: Page,
  options: {
    label?: string;
    tolerancePx?: number;
    checkWheelResistance?: boolean;
  } = {},
): Promise<ViewportScrollMetrics> {
  const { label = "Desktop Viewport", tolerancePx = 0, checkWheelResistance = true } = options;

  const metrics: ViewportScrollMetrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollHeight = Math.max(doc.scrollHeight, body.scrollHeight);
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
    const clientHeight = doc.clientHeight;
    const clientWidth = doc.clientWidth;
    const windowInnerHeight = window.innerHeight;
    const windowInnerWidth = window.innerWidth;
    const verticalOverflowPx = Math.max(0, scrollHeight - windowInnerHeight);
    const horizontalOverflowPx = Math.max(0, scrollWidth - windowInnerWidth);

    return {
      scrollHeight,
      clientHeight,
      scrollWidth,
      clientWidth,
      windowInnerHeight,
      windowInnerWidth,
      verticalOverflowPx,
      horizontalOverflowPx,
      hasVerticalBodyScroll: verticalOverflowPx > 0,
      hasHorizontalBodyScroll: horizontalOverflowPx > 0,
    };
  });

  expect(
    metrics.verticalOverflowPx,
    `[${label}] Document vertical body scroll detected! Document scroll height (${metrics.scrollHeight}px) exceeds window inner height (${metrics.windowInnerHeight}px) by ${metrics.verticalOverflowPx}px.`,
  ).toBeLessThanOrEqual(tolerancePx);

  expect(
    metrics.horizontalOverflowPx,
    `[${label}] Document horizontal body scroll detected! Document scroll width (${metrics.scrollWidth}px) exceeds window inner width (${metrics.windowInnerWidth}px) by ${metrics.horizontalOverflowPx}px.`,
  ).toBeLessThanOrEqual(tolerancePx);

  if (checkWheelResistance) {
    // Attempt vertical scroll down via mouse wheel
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(100);

    const scrollYAfter = await page.evaluate(() => window.scrollY);
    metrics.scrollYAfterWheel = scrollYAfter;

    expect(
      scrollYAfter,
      `[${label}] Document body responded to mouse wheel! window.scrollY shifted from 0 to ${scrollYAfter}px.`,
    ).toBe(0);

    // Reset scroll just in case
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  return metrics;
}

/**
 * Asserts that the document has zero horizontal overflow across responsive viewports,
 * specifically ensuring mobile views (390x844, 360x640) do not bleed outside the viewport width.
 * If overflow occurs, identifies and lists culprit DOM elements for rapid diagnosis.
 */
export async function assertZeroHorizontalOverflow(
  page: Page,
  options: {
    label?: string;
    tolerancePx?: number;
  } = {},
): Promise<HorizontalOverflowMetrics> {
  const { label = "Responsive Viewport", tolerancePx = 1 } = options;

  const metrics: HorizontalOverflowMetrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
    const clientWidth = doc.clientWidth;
    const windowInnerWidth = window.innerWidth;
    const horizontalOverflowPx = Math.max(0, scrollWidth - clientWidth);

    const culpritElements: string[] = [];
    const elements = document.querySelectorAll("*");
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > windowInnerWidth + 1 && rect.width > 0 && rect.height > 0) {
        const id = el.id ? `#${el.id}` : "";
        const cls =
          el.className && typeof el.className === "string"
            ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
            : "";
        culpritElements.push(
          `${el.tagName.toLowerCase()}${id}${cls} [right=${Math.round(rect.right)}px, w=${Math.round(rect.width)}px]`,
        );
        if (culpritElements.length >= 5) break;
      }
    }

    return {
      scrollWidth,
      clientWidth,
      windowInnerWidth,
      horizontalOverflowPx,
      culpritElements,
    };
  });

  expect(
    metrics.horizontalOverflowPx,
    `[${label}] Unwanted horizontal overflow detected! scrollWidth (${metrics.scrollWidth}px) exceeds clientWidth (${metrics.clientWidth}px) by ${metrics.horizontalOverflowPx}px.${
      metrics.culpritElements.length > 0 ? ` Culprits: [${metrics.culpritElements.join(", ")}]` : ""
    }`,
  ).toBeLessThanOrEqual(tolerancePx);

  return metrics;
}

/**
 * Asserts spatial containment of a specific DOM element:
 * Verifies that the target element remains completely contained within the viewport boundaries
 * (or within an optional parent container element).
 */
export async function assertSpatialContainment(
  page: Page,
  selector: string,
  options: {
    label?: string;
    parentSelector?: string;
    tolerancePx?: number;
  } = {},
): Promise<SpatialContainmentMetrics> {
  const { label = `Element '${selector}'`, parentSelector, tolerancePx = 1 } = options;

  const locator = page.locator(selector).first();
  await expect(locator, `[${label}] Target element must be attached and visible`).toBeVisible();

  const metrics: SpatialContainmentMetrics = await page.evaluate(
    ({ sel, parentSel }) => {
      const el = document.querySelector(sel);
      if (!el) {
        throw new Error(`Element not found for selector: ${sel}`);
      }

      const rect = el.getBoundingClientRect();
      const elementBounds: SpatialBoundingBox = {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        bottom: Math.round(rect.bottom),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };

      const viewportBounds = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const isWithinViewport =
        elementBounds.top >= -1 &&
        elementBounds.left >= -1 &&
        elementBounds.bottom <= viewportBounds.height + 1 &&
        elementBounds.right <= viewportBounds.width + 1;

      let parentBounds: SpatialBoundingBox | undefined;
      let isWithinParent: boolean | undefined;

      if (parentSel) {
        const parent = document.querySelector(parentSel);
        if (parent) {
          const pRect = parent.getBoundingClientRect();
          parentBounds = {
            top: Math.round(pRect.top),
            left: Math.round(pRect.left),
            bottom: Math.round(pRect.bottom),
            right: Math.round(pRect.right),
            width: Math.round(pRect.width),
            height: Math.round(pRect.height),
          };

          isWithinParent =
            elementBounds.top >= parentBounds.top - 1 &&
            elementBounds.left >= parentBounds.left - 1 &&
            elementBounds.bottom <= parentBounds.bottom + 1 &&
            elementBounds.right <= parentBounds.right + 1;
        }
      }

      return {
        elementSelector: sel,
        elementBounds,
        viewportBounds,
        parentBounds,
        isWithinViewport,
        isWithinParent,
      };
    },
    { sel: selector, parentSel: parentSelector },
  );

  if (parentSelector && metrics.parentBounds) {
    expect(
      metrics.elementBounds.top,
      `[${label}] Element top (${metrics.elementBounds.top}px) exceeds parent top (${metrics.parentBounds.top}px)`,
    ).toBeGreaterThanOrEqual(metrics.parentBounds.top - tolerancePx);

    expect(
      metrics.elementBounds.bottom,
      `[${label}] Element bottom (${metrics.elementBounds.bottom}px) exceeds parent bottom (${metrics.parentBounds.bottom}px)`,
    ).toBeLessThanOrEqual(metrics.parentBounds.bottom + tolerancePx);

    expect(
      metrics.elementBounds.left,
      `[${label}] Element left (${metrics.elementBounds.left}px) exceeds parent left (${metrics.parentBounds.left}px)`,
    ).toBeGreaterThanOrEqual(metrics.parentBounds.left - tolerancePx);

    expect(
      metrics.elementBounds.right,
      `[${label}] Element right (${metrics.elementBounds.right}px) exceeds parent right (${metrics.parentBounds.right}px)`,
    ).toBeLessThanOrEqual(metrics.parentBounds.right + tolerancePx);
  } else {
    expect(
      metrics.elementBounds.top,
      `[${label}] Element top (${metrics.elementBounds.top}px) must be >= 0`,
    ).toBeGreaterThanOrEqual(-tolerancePx);

    expect(
      metrics.elementBounds.bottom,
      `[${label}] Element bottom (${metrics.elementBounds.bottom}px) exceeds viewport height (${metrics.viewportBounds.height}px)`,
    ).toBeLessThanOrEqual(metrics.viewportBounds.height + tolerancePx);

    expect(
      metrics.elementBounds.left,
      `[${label}] Element left (${metrics.elementBounds.left}px) must be >= 0`,
    ).toBeGreaterThanOrEqual(-tolerancePx);

    expect(
      metrics.elementBounds.right,
      `[${label}] Element right (${metrics.elementBounds.right}px) exceeds viewport width (${metrics.viewportBounds.width}px)`,
    ).toBeLessThanOrEqual(metrics.viewportBounds.width + tolerancePx);
  }

  return metrics;
}
