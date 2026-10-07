import "server-only";
import { prisma } from "@/lib/db";

export async function canManageProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, creatorId: true },
  });
  if (!project) return null;
  if (project.creatorId === userId) return project;

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return actor?.role === "ADMIN" ? project : "FORBIDDEN";
}
