import { z } from "zod";

export const projectStatusSchema = z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]);
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  targetDate: z.string().date().optional().or(z.literal("")),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  status: projectStatusSchema.optional(),
  targetDate: z.string().date().nullable().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2_000).optional().or(z.literal("")),
  status: taskStatusSchema.default("TODO"),
  priority: taskPrioritySchema.default("MEDIUM"),
  dueDate: z.string().date().optional().or(z.literal("")),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().max(2_000).optional().or(z.literal("")),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().date().nullable().optional(),
  assigneeId: z.string().min(1).max(128).nullable().optional(),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2_000),
});
