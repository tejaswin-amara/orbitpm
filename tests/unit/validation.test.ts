import { describe, expect, it } from "vitest";
import {
  createCommentSchema,
  createProjectSchema,
  createTaskSchema,
  projectStatusSchema,
  taskPrioritySchema,
  taskStatusSchema,
  updateProjectSchema,
  updateTaskSchema,
} from "@/lib/validation";

describe("Zod Validation Schemas Unit Tests", () => {
  describe("Enum Schemas", () => {
    it("validates allowed project statuses and rejects invalid ones", () => {
      const validStatuses = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"];
      for (const status of validStatuses) {
        expect(projectStatusSchema.safeParse(status).success).toBe(true);
      }
      expect(projectStatusSchema.safeParse("CANCELLED").success).toBe(false);
      expect(projectStatusSchema.safeParse("").success).toBe(false);
    });

    it("validates allowed task statuses and rejects invalid ones", () => {
      const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
      for (const status of validStatuses) {
        expect(taskStatusSchema.safeParse(status).success).toBe(true);
      }
      expect(taskStatusSchema.safeParse("BLOCKED").success).toBe(false);
    });

    it("validates allowed task priorities and rejects invalid ones", () => {
      const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
      for (const priority of validPriorities) {
        expect(taskPrioritySchema.safeParse(priority).success).toBe(true);
      }
      expect(taskPrioritySchema.safeParse("CRITICAL").success).toBe(false);
    });
  });

  describe("createProjectSchema", () => {
    it("accepts valid project creation payload with full fields", () => {
      const result = createProjectSchema.safeParse({
        name: "Infrastructure Modernization",
        description: "Migrating core services to serverless infrastructure",
        targetDate: "2026-12-31",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Infrastructure Modernization");
        expect(result.data.targetDate).toBe("2026-12-31");
      }
    });

    it("accepts valid project creation payload with minimal fields", () => {
      const result = createProjectSchema.safeParse({
        name: "Security Audit",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Security Audit");
      }
    });

    it("trims whitespace on name and description", () => {
      const result = createProjectSchema.safeParse({
        name: "   Frontend Refactor   ",
        description: "   Clean up legacy stylesheets   ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Frontend Refactor");
        expect(result.data.description).toBe("Clean up legacy stylesheets");
      }
    });

    it("allows empty string for optional description and targetDate", () => {
      const result = createProjectSchema.safeParse({
        name: "Valid Project",
        description: "",
        targetDate: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects names shorter than 2 characters or longer than 80 characters", () => {
      const tooShort = createProjectSchema.safeParse({ name: "A" });
      expect(tooShort.success).toBe(false);

      const tooLong = createProjectSchema.safeParse({ name: "A".repeat(81) });
      expect(tooLong.success).toBe(false);
    });

    it("rejects descriptions exceeding 500 characters", () => {
      const result = createProjectSchema.safeParse({
        name: "Valid Name",
        description: "A".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date strings for targetDate", () => {
      const result = createProjectSchema.safeParse({
        name: "Valid Project",
        targetDate: "not-a-date",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateProjectSchema", () => {
    it("accepts partial updates including nullable targetDate", () => {
      const result = updateProjectSchema.safeParse({
        status: "ACTIVE",
        targetDate: null,
      });
      expect(result.success).toBe(true);
    });

    it("accepts updating name and status together", () => {
      const result = updateProjectSchema.safeParse({
        name: "Updated Project Name",
        status: "COMPLETED",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = updateProjectSchema.safeParse({
        status: "INVALID_STATUS",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createTaskSchema", () => {
    it("supplies default status (TODO) and priority (MEDIUM) when omitted", () => {
      const result = createTaskSchema.safeParse({
        title: "Implement auth middleware",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("TODO");
        expect(result.data.priority).toBe("MEDIUM");
      }
    });

    it("accepts custom status, priority, description, and dueDate", () => {
      const result = createTaskSchema.safeParse({
        title: "Hotfix payment webhook",
        status: "IN_PROGRESS",
        priority: "URGENT",
        description: "Investigate timeout errors from gateway",
        dueDate: "2026-11-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("IN_PROGRESS");
        expect(result.data.priority).toBe("URGENT");
      }
    });

    it("rejects titles shorter than 2 or longer than 140 characters", () => {
      expect(createTaskSchema.safeParse({ title: "X" }).success).toBe(false);
      expect(createTaskSchema.safeParse({ title: "X".repeat(141) }).success).toBe(false);
    });
  });

  describe("updateTaskSchema", () => {
    it("accepts partial task updates with nullable assigneeId and dueDate", () => {
      const result = updateTaskSchema.safeParse({
        status: "DONE",
        assigneeId: null,
        dueDate: null,
      });
      expect(result.success).toBe(true);
    });

    it("accepts assigneeId updates with valid string id", () => {
      const result = updateTaskSchema.safeParse({
        assigneeId: "user-uuid-1234",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("createCommentSchema", () => {
    it("accepts valid comment body within 1 to 2000 characters", () => {
      const result = createCommentSchema.safeParse({
        body: "LGTM! Approved for deployment to production.",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body).toBe("LGTM! Approved for deployment to production.");
      }
    });

    it("rejects empty comments or comments exceeding 2000 characters", () => {
      expect(createCommentSchema.safeParse({ body: "" }).success).toBe(false);
      expect(createCommentSchema.safeParse({ body: "   " }).success).toBe(false);
      expect(createCommentSchema.safeParse({ body: "a".repeat(2001) }).success).toBe(false);
    });
  });
});
