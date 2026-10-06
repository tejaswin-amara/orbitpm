import { describe, expect, it } from "vitest";
import { uniqueSlug } from "@/lib/slug";

describe("uniqueSlug Utility Unit Tests", () => {
  it("converts standard names to clean lowercase hyphenated slugs", () => {
    const slug = uniqueSlug("Origins Internal Workspace", "12345678-abcd");
    expect(slug).toBe("origins-internal-workspace-12345678");
  });

  it("handles special characters, punctuation, and multiple consecutive symbols", () => {
    const slug = uniqueSlug("Next.js 16 & Turbopack: Deep Dive!", "abcdef12-3456");
    expect(slug).toBe("next-js-16-turbopack-deep-dive-abcdef12");
  });

  it("strips leading and trailing hyphens and extra whitespace", () => {
    const slug = uniqueSlug("   ---Production Release 2026---   ", "fedcba98-7654");
    expect(slug).toBe("production-release-2026-fedcba98");
  });

  it("falls back to 'project' when input string has no alphanumeric characters", () => {
    const slug1 = uniqueSlug("!@#$%^&*()", "11223344-5566");
    expect(slug1).toBe("project-11223344");

    const slug2 = uniqueSlug("      ", "aabbccdd-eeff");
    expect(slug2).toBe("project-aabbccdd");

    const slug3 = uniqueSlug("", "00112233-4455");
    expect(slug3).toBe("project-00112233");
  });

  it("truncates long names to maximum 50 characters for the base portion", () => {
    const longName = "a".repeat(80);
    const slug = uniqueSlug(longName, "1234567890");
    const parts = slug.split("-");
    const suffix = parts.pop();
    const base = parts.join("-");

    expect(base.length).toBeLessThanOrEqual(50);
    expect(suffix).toBe("12345678");
  });

  it("guarantees unique slugs for identical names with different uuid suffixes", () => {
    const name = "Sprint Planning";
    const slugA = uniqueSlug(name, "uuid-one-1234");
    const slugB = uniqueSlug(name, "uuid-two-5678");

    expect(slugA).not.toBe(slugB);
    expect(slugA).toBe("sprint-planning-uuid-one");
    expect(slugB).toBe("sprint-planning-uuid-two");
  });
});
