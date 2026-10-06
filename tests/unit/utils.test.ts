import { describe, expect, it } from "vitest";
import { isOverdue } from "@/lib/utils";
import { uniqueSlug } from "@/lib/slug";

describe("date helpers", () => {
  it("detects overdue work", () => {
    expect(isOverdue("2020-01-01", "TODO")).toBe(true);
    expect(isOverdue("2020-01-01", "DONE")).toBe(false);
  });
});

describe("slug generation", () => {
  it("creates a stable readable project slug", () => {
    expect(uniqueSlug("Website Relaunch", "abcdef123456")).toBe("website-relaunch-abcdef12");
  });
});
