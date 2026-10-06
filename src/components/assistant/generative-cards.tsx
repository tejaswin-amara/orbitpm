"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  ListTodo,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { ProjectHealthData, SprintSummaryData, TaskPreviewData } from "./types";

export function SprintSummaryCard({ data }: { data: SprintSummaryData }) {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <TrendingUp className="size-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Sprint Velocity & Health</span>
        </div>
        <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
          {data.completionRate}% complete
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{data.narrative}</p>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Delivery Progress</span>
          <span>
            {data.completedTasks} / {data.totalTasks} tasks done
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, data.completionRate))}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 pt-1 text-center">
        <div className="rounded-xl border border-border/60 bg-muted/40 p-2">
          <div className="text-xs text-muted-foreground">Todo</div>
          <div className="text-sm font-semibold text-foreground">{data.todoTasks}</div>
        </div>
        <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-2">
          <div className="text-xs text-cyan-300">Active</div>
          <div className="text-sm font-semibold text-cyan-200">{data.inProgressTasks}</div>
        </div>
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-2">
          <div className="text-xs text-amber-300">Review</div>
          <div className="text-sm font-semibold text-amber-200">{data.reviewTasks}</div>
        </div>
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-2">
          <div className="text-xs text-emerald-300">Done</div>
          <div className="text-sm font-semibold text-emerald-200">{data.completedTasks}</div>
        </div>
      </div>

      {data.blockers.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Flame className="size-3.5" /> Blockers & Risks
          </div>
          {data.blockers.map((blocker, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: list is read-only
            <div key={i} className="text-[11px] text-amber-200/80">
              • {blocker}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskPreviewCard({
  data,
  onConfirm,
}: {
  data: TaskPreviewData;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Plus className="size-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Generative Quick Task</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
            data.priority === "URGENT"
              ? "bg-red-500/20 text-red-300 border-red-500/30"
              : data.priority === "HIGH"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
          }`}
        >
          {data.priority}
        </span>
      </div>

      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/60 p-3">
        <div className="text-xs font-medium text-foreground">{data.title}</div>
        {data.description && (
          <div className="text-[11px] text-muted-foreground">{data.description}</div>
        )}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-cyan-400 hover:to-indigo-500 transition-all cursor-pointer"
      >
        <CheckCircle2 className="size-4" /> Confirm & Add to Project Board
      </button>
    </div>
  );
}

export function ProjectHealthCard({ data }: { data: ProjectHealthData }) {
  const isHealthy = data.healthScore >= 75;

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex size-7 items-center justify-center rounded-lg ${
              isHealthy ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {isHealthy ? <ShieldCheck className="size-4" /> : <AlertTriangle className="size-4" />}
          </div>
          <span className="text-sm font-semibold text-foreground">Project Delivery Health</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
            isHealthy
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
          }`}
        >
          {data.status} ({data.healthScore}/100)
        </span>
      </div>

      {data.riskFactors.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-foreground">Identified Risk Factors</div>
          <div className="space-y-1">
            {data.riskFactors.map((rf, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: list is static
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-300/90">
                <Clock className="size-3 mt-0.5 shrink-0" />
                <span>{rf}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recommendations.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-medium text-foreground">Actionable Recommendations</div>
          <div className="space-y-1">
            {data.recommendations.map((rec, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: list is static
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <ArrowRight className="size-3 mt-0.5 shrink-0 text-cyan-400" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskListCard({
  tasks,
  onSelectTask,
}: {
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string | null;
  }>;
  onSelectTask?: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 p-5 backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <ListTodo className="size-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Filtered Tasks</span>
        </div>
        <span className="text-xs text-muted-foreground">{tasks.length} found</span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto spatial-scrollbar pr-1">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onSelectTask?.(task.id)}
            className="w-full flex items-center justify-between rounded-xl border border-border/50 bg-muted/40 p-2.5 text-left text-xs hover:border-cyan-500/40 hover:bg-muted/70 transition-all cursor-pointer"
          >
            <span className="font-medium text-foreground truncate mr-2">{task.title}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded-md bg-muted border border-border/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {task.status}
              </span>
              <span className="rounded-md bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-600 dark:text-cyan-300">
                {task.priority}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
