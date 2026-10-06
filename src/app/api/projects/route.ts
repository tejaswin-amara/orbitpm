import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ensureWorkspaceForUser } from "@/lib/workspaces";
import { createProjectSchema } from "@/lib/validation";
import { jsonError } from "@/lib/http";
import { uniqueSlug } from "@/lib/slug";
import { recordActivity } from "@/lib/activity";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const workspace = await ensureWorkspaceForUser(session.user.id);
  const projects = await prisma.project.findMany({ where: { workspaceId: workspace.id }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { tasks: true } } } });
  return Response.json({ projects });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const parsed = createProjectSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 422);
  const workspace = await ensureWorkspaceForUser(session.user.id);
  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      creatorId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      targetDate: parsed.data.targetDate ? new Date(`${parsed.data.targetDate}T00:00:00.000Z`) : null,
      slug: uniqueSlug(parsed.data.name, crypto.randomUUID()),
    },
  });
  await recordActivity({ workspaceId: workspace.id, actorId: session.user.id, projectId: project.id, action: "project.created", metadata: { name: project.name } });
  return Response.json({ project }, { status: 201 });
}
