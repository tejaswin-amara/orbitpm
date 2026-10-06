import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export default async function ProjectsPage() {
  await requireSession();
  const projects = await prisma.project.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">Projects</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your delivery surface</h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep scope, status, and work visible without another service.
          </p>
        </div>
        <CreateProjectForm />
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">No projects yet.</p>
          </Card>
        ) : (
          projects.map((project) => (
            <Link key={project.id} href={`/app/projects/${project.id}`}>
              <Card className="transition hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.description || "No description."}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-slate-400" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <Badge
                    tone={
                      project.status === "ACTIVE"
                        ? "blue"
                        : project.status === "COMPLETED"
                          ? "green"
                          : "slate"
                    }
                  >
                    {project.status.replaceAll("_", " ")}
                  </Badge>
                  <span className="text-xs text-slate-500">{project._count.tasks} tasks</span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
