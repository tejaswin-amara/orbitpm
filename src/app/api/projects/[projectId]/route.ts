import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWorkspaceForUser, canManageWorkspace } from "@/lib/workspaces";
import { updateProjectSchema } from "@/lib/validation";
import { jsonError } from "@/lib/http";
import { recordActivity } from "@/lib/activity";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession(); if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const workspace = await getWorkspaceForUser(session.user.id); if (!workspace) return jsonError("Workspace not found", 404);
  const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId: workspace.workspaceId }, include: { _count: { select: { tasks: true, comments: true } } } });
  if (!project) return jsonError("Project not found", 404);
  return Response.json({ project });
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession(); if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const workspace = await getWorkspaceForUser(session.user.id); if (!workspace) return jsonError("Workspace not found", 404);
  if (!canManageWorkspace(workspace.role)) return jsonError("Forbidden", 403);
  const parsed = updateProjectSchema.safeParse(await request.json()); if (!parsed.success) return jsonError("Invalid request", 422);
  const current = await prisma.project.findFirst({ where: { id: projectId, workspaceId: workspace.workspaceId } }); if (!current) return jsonError("Project not found", 404);
  const project = await prisma.project.update({ where: { id: projectId }, data: { ...parsed.data, targetDate: parsed.data.targetDate === undefined ? undefined : parsed.data.targetDate ? new Date(`${parsed.data.targetDate}T00:00:00.000Z`) : null, description: parsed.data.description === "" ? null : parsed.data.description } });
  await recordActivity({ workspaceId: workspace.workspaceId, actorId: session.user.id, projectId, action: "project.updated", metadata: { status: project.status } });
  return Response.json({ project });
}

export async function DELETE(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession(); if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const workspace = await getWorkspaceForUser(session.user.id); if (!workspace) return jsonError("Workspace not found", 404);
  if (!canManageWorkspace(workspace.role)) return jsonError("Forbidden", 403);
  const current = await prisma.project.findFirst({ where: { id: projectId, workspaceId: workspace.workspaceId } }); if (!current) return jsonError("Project not found", 404);
  await prisma.project.delete({ where: { id: projectId } });
  await recordActivity({ workspaceId: workspace.workspaceId, actorId: session.user.id, action: "project.deleted", metadata: { projectId } });
  return new Response(null, { status: 204 });
}
