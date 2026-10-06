import { ArrowUpRight, CircleAlert, FolderKanban, ListChecks } from "lucide-react";
import Link from "next/link";
import { SplitText } from "@/components/react-bits/SplitText";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { formatDate, isOverdue } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const projects = await prisma.project.findMany({
    where: { status: { not: "ARCHIVED" } },
    include: { tasks: { select: { id: true, status: true, dueDate: true } } },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
  const openTasks = projects.reduce(
    (total, project) => total + project.tasks.filter((task) => task.status !== "DONE").length,
    0,
  );
  const overdue = projects.reduce(
    (total, project) =>
      total + project.tasks.filter((task) => isOverdue(task.dueDate, task.status)).length,
    0,
  );
  const completed = projects.reduce(
    (total, project) => total + project.tasks.filter((task) => task.status === "DONE").length,
    0,
  );
  const totalTasks = projects.reduce((total, project) => total + project.tasks.length, 0);

  return (
    <div className="h-full w-full overflow-y-auto spatial-scrollbar p-5 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">OrbitPM Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              <SplitText text={`Good morning, ${session.user.name.split(" ")[0]}.`} />
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Here is the current shape of your work.
            </p>
          </div>
          <Link
            href="/app/projects"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors shadow-xs"
          >
            Open projects <ArrowUpRight className="size-4" />
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Active projects"
            value={String(projects.length)}
            icon={<FolderKanban className="size-4" />}
          />
          <MetricCard
            label="Open tasks"
            value={String(openTasks)}
            icon={<ListChecks className="size-4" />}
            detail={`${completed}/${totalTasks || 0} tasks done`}
          />
          <MetricCard
            label="Overdue"
            value={String(overdue)}
            icon={<CircleAlert className="size-4" />}
            detail={overdue ? "Needs attention" : "Nothing overdue"}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent projects</h2>
            <Link
              href="/app/projects"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.length === 0 ? (
              <Card className="glass-panel">
                <div className="py-10 text-center">
                  <h3 className="font-semibold text-foreground">No projects yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create the first one and your dashboard will populate automatically.
                  </p>
                </div>
              </Card>
            ) : (
              projects.map((project) => {
                const done = project.tasks.filter((task) => task.status === "DONE").length;
                const progress = project.tasks.length
                  ? Math.round((done / project.tasks.length) * 100)
                  : 0;
                return (
                  <Link key={project.id} href={`/app/projects/${project.id}`}>
                    <Card className="glass-card transition-all hover:-translate-y-0.5 hover:shadow-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{project.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {project.description || "No description."}
                          </p>
                        </div>
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
                      </div>
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {done} of {project.tasks.length} tasks done
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">
                        Target {formatDate(project.targetDate)}
                      </div>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: React.ReactNode;
}) {
  return (
    <SpotlightCard
      className="p-5 border border-border/70 bg-card/60 backdrop-blur-xl rounded-2xl shadow-sm"
      spotlightColor="rgba(99, 102, 241, 0.15)"
    >
      <div className="flex items-center justify-between text-muted-foreground relative z-10">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-foreground/80">{icon}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-foreground relative z-10">
        {value}
      </div>
      {detail && <div className="mt-1 text-xs text-muted-foreground relative z-10">{detail}</div>}
    </SpotlightCard>
  );
}
