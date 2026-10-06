import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProjectBoard } from "@/components/projects/project-board";
import { ProjectComments } from "@/components/projects/project-comments";
import { ensureWorkspaceForUser } from "@/lib/workspaces";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await requireSession();
  const { projectId } = await params;
  const workspace = await ensureWorkspaceForUser(session.user.id);
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: workspace.id },
    include: {
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { tasks: true } },
    },
  });
  if (!project) return <Card><p className="text-sm text-slate-500">Project not found.</p></Card>;

  return <div className="mx-auto max-w-7xl space-y-7"><Link href="/app/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="size-4" /> Projects</Link><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex flex-wrap items-center gap-2"><Badge tone={project.status === "ACTIVE" ? "blue" : project.status === "COMPLETED" ? "green" : "slate"}>{project.status.replaceAll("_", " ")}</Badge>{project.targetDate && <span className="text-xs text-slate-500">Target {formatDate(project.targetDate)}</span>}</div><h1 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{project.description || "No project description."}</p></div></header><ProjectBoard projectId={project.id} /><ProjectComments projectId={project.id} initialComments={project.comments.map((comment) => ({ id: comment.id, body: comment.body, createdAt: comment.createdAt.toISOString(), author: comment.author }))} /></div>;
}
