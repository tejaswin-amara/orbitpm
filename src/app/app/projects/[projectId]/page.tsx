import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  await requireSession();
  const { projectId } = await params;

  const project = await prisma.project
    .findFirst({
      where: { id: projectId },
      include: {
        comments: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { tasks: true } },
      },
    })
    .catch(() => null);

  if (!project) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Project not found.</p>
        </Card>
      </div>
    );
  }

  const serializedComments = project.comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: comment.author,
  }));

  return (
    <ProjectDetailView
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        targetDate: project.targetDate,
      }}
      comments={serializedComments}
    />
  );
}
