import { recordActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { getSession } from "@/lib/session";
import { createTaskSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) return jsonError("Project not found", 404);
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { assignee: { select: { name: true } } },
  });
  return Response.json({ tasks });
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) return jsonError("Project not found", 404);
  const parsed = createTaskSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 422);
  const task = await prisma.task.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ? new Date(`${parsed.data.dueDate}T00:00:00.000Z`) : null,
    },
  });
  await recordActivity({
    actorId: session.user.id,
    projectId,
    taskId: task.id,
    action: "task.created",
    metadata: { title: task.title },
  });
  return Response.json({ task }, { status: 201 });
}
