import { recordActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { getSession } from "@/lib/session";
import { createCommentSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { projectId } = await context.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) return jsonError("Project not found", 404);
  const parsed = createCommentSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 422);
  const comment = await prisma.comment.create({
    data: { projectId, authorId: session.user.id, body: parsed.data.body },
    include: { author: { select: { name: true } } },
  });
  await recordActivity({
    actorId: session.user.id,
    projectId,
    action: "comment.created",
  });
  return Response.json({ comment }, { status: 201 });
}
