import Link from "next/link";
import { ArrowUpRight, CircleAlert, FolderKanban, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/session";
import { ensureWorkspaceForUser } from "@/lib/workspaces";
import { prisma } from "@/lib/db";
import { formatDate, isOverdue } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const workspace = await ensureWorkspaceForUser(session.user.id);
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id, status: { not: "ARCHIVED" } },
    include: { tasks: { select: { id: true, status: true, dueDate: true } } },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
  const openTasks = projects.reduce((total, project) => total + project.tasks.filter((task) => task.status !== "DONE").length, 0);
  const overdue = projects.reduce((total, project) => total + project.tasks.filter((task) => isOverdue(task.dueDate, task.status)).length, 0);
  const completed = projects.reduce((total, project) => total + project.tasks.filter((task) => task.status === "DONE").length, 0);
  const totalTasks = projects.reduce((total, project) => total + project.tasks.length, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">{workspace.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Good morning, {session.user.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm text-slate-500">Here is the current shape of your work.</p>
        </div>
        <Link href="/app/projects" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-950">Open projects <ArrowUpRight className="size-4" /></Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active projects" value={String(projects.length)} icon={<FolderKanban className="size-4" />} />
        <MetricCard label="Open tasks" value={String(openTasks)} icon={<ListChecks className="size-4" />} detail={`${completed}/${totalTasks || 0} tasks done`} />
        <MetricCard label="Overdue" value={String(overdue)} icon={<CircleAlert className="size-4" />} detail={overdue ? "Needs attention" : "Nothing overdue"} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Recent projects</h2><Link href="/app/projects" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">View all</Link></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.length === 0 ? <Card><div className="py-10 text-center"><h3 className="font-semibold">No projects yet</h3><p className="mt-1 text-sm text-slate-500">Create the first one and your dashboard will populate automatically.</p></div></Card> : projects.map((project) => {
            const done = project.tasks.filter((task) => task.status === "DONE").length;
            const progress = project.tasks.length ? Math.round((done / project.tasks.length) * 100) : 0;
            return <Link key={project.id} href={`/app/projects/${project.id}`}><Card className="transition hover:-translate-y-0.5 hover:shadow-xl"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{project.name}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description || "No description."}</p></div><Badge tone={project.status === "ACTIVE" ? "blue" : project.status === "COMPLETED" ? "green" : "slate"}>{project.status.replaceAll("_", " ")}</Badge></div><div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs text-slate-500"><span>{done} of {project.tasks.length} tasks done</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-slate-950 dark:bg-white" style={{ width: `${progress}%` }} /></div></div><div className="mt-4 text-xs text-slate-500">Target {formatDate(project.targetDate)}</div></Card></Link>;
          })}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: React.ReactNode }) {
  return <Card><div className="flex items-center justify-between text-slate-500"><span className="text-sm">{label}</span><span>{icon}</span></div><div className="mt-4 text-3xl font-semibold">{value}</div>{detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}</Card>;
}
