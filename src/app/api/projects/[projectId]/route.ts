import { canManageProject } from "@/lib/authz";
import { recordActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { getSession } from "@/lib/session";
import { updateProjectSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: { _count: { select: { tasks: true, comments: true } } },
  });
  if (!project) return jsonError("Project not found", 404);
  return Response.json({ project });
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const parsed = updateProjectSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid request", 422);
  const access = await canManageProject(projectId, session.user.id);
  if (!access) return jsonError("Project not found", 404);
  if (access === false) return jsonError("Forbidden", 403);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...parsed.data,
      targetDate:
        parsed.data.targetDate === undefined
          ? undefined
          : parsed.data.targetDate
            ? new Date(`${parsed.data.targetDate}T00:00:00.000Z`)
            : null,
      description: parsed.data.description === "" ? null : parsed.data.description,
    },
  });
  await recordActivity({
    actorId: session.user.id,
    projectId,
    action: "project.updated",
    metadata: { status: project.status },
  });
  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const access = await canManageProject(projectId, session.user.id);
  if (!access) return jsonError("Project not found", 404);
  if (access === false) return jsonError("Forbidden", 403);

  await prisma.project.delete({ where: { id: projectId } });
  return new Response(null, { status: 204 });
}
