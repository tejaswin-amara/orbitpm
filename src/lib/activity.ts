import { prisma } from "@/lib/db";

export async function recordActivity(input: {
  actorId: string;
  action: string;
  projectId?: string;
  taskId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  return prisma.activityEvent.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      projectId: input.projectId,
      taskId: input.taskId,
      metadata: input.metadata,
    },
  });
}
