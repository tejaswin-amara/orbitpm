import { recordActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { getSession } from "@/lib/session";
import { updateTaskSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { taskId } = await context.params;
  const current = await prisma.task.findFirst({
    where: { id: taskId },
  });
  if (!current) return jsonError("Task not found", 404);
  const parsed = updateTaskSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid request", 422);
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...parsed.data,
      description: parsed.data.description === "" ? null : parsed.data.description,
      dueDate:
        parsed.data.dueDate === undefined
          ? undefined
          : parsed.data.dueDate
            ? new Date(`${parsed.data.dueDate}T00:00:00.000Z`)
            : null,
    },
  });
  await recordActivity({
    actorId: session.user.id,
    projectId: task.projectId,
    taskId,
    action: parsed.data.status ? "task.status_changed" : "task.updated",
    metadata: { status: task.status },
  });
  return Response.json({ task });
}

export async function DELETE(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { taskId } = await context.params;
  const current = await prisma.task.findFirst({
    where: { id: taskId },
  });
  if (!current) return jsonError("Task not found", 404);
  await prisma.task.delete({ where: { id: taskId } });
  await recordActivity({
    actorId: session.user.id,
    projectId: current.projectId,
    action: "task.deleted",
    metadata: { taskId },
  });
  return new Response(null, { status: 204 });
}
