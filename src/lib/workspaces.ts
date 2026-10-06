import { prisma } from "@/lib/db";

export async function ensureWorkspaceForUser(userId: string) {
  const existing = await prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.workspace;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const base = slugify(user.name || "workspace");
  const slug = `${base}-${user.id.slice(0, 8)}`;

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name: `${user.name || "My"} Workspace`, slug },
    });
    await tx.membership.create({
      data: { workspaceId: workspace.id, userId, role: "OWNER" },
    });
    return workspace;
  });
}

export async function getWorkspaceForUser(userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true, },
    orderBy: { createdAt: "asc" },
  });
}

export async function getMembership(userId: string, workspaceId: string) {
  return prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
}

export function canManageWorkspace(role: "OWNER" | "ADMIN" | "MEMBER") {
  return role === "OWNER" || role === "ADMIN";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "workspace";
}
