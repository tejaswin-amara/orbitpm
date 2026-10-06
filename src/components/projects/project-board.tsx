"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, isOverdue } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  assignee: { name: string } | null;
};

type TaskResponse = { tasks: Task[] };

const columns = [
  ["TODO", "Todo"],
  ["IN_PROGRESS", "In progress"],
  ["REVIEW", "Review"],
  ["DONE", "Done"],
] as const;

const priorityTone = {
  LOW: "slate",
  MEDIUM: "blue",
  HIGH: "amber",
  URGENT: "red",
} as const;

async function fetchTasks(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/tasks`);
  if (!response.ok) throw new Error("Could not load tasks.");
  return (await response.json()) as TaskResponse;
}

export function ProjectBoard({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [openNewTask, setOpenNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task["status"] | null>(null);

  const query = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchTasks(projectId),
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description, priority, dueDate }),
      });
      if (!response.ok)
        throw new Error(
          ((await response.json()) as { error?: string }).error ?? "Could not create task.",
        );
    },
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setOpenNewTask(false);
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const moveTask = useMutation({
    mutationFn: async (input: { taskId: string; status: Task["status"] }) => {
      const response = await fetch(`/api/tasks/${input.taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: input.status }),
      });
      if (!response.ok) throw new Error("Could not update task.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: { taskId: string; patch: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${input.taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input.patch),
      });
      if (!response.ok) throw new Error("Could not update task.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete task.");
    },
    onSuccess: async () => {
      setSelectedTask(null);
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  // Keep selectedTask synchronized with latest query data
  useEffect(() => {
    if (!selectedTask || !query.data?.tasks) return;
    const latest = query.data.tasks.find((t) => t.id === selectedTask.id);
    if (latest) setSelectedTask(latest);
  }, [query.data, selectedTask]);

  // Handle ESC key for closing the inspector sheet
  useEffect(() => {
    if (!selectedTask) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTask(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTask]);

  const grouped = useMemo(
    () =>
      columns.map(([status, label]) => ({
        status,
        label,
        tasks: query.data?.tasks.filter((task) => task.status === status) ?? [],
      })),
    [query.data],
  );

  const handleDragStart = (e: React.DragEvent<HTMLElement>, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnStatus: Task["status"]) => {
    e.preventDefault();
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      moveTask.mutate({ taskId, status: targetStatus });
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  if (query.isLoading)
    return (
      <div className="grid h-full gap-4 xl:grid-cols-4">
        {columns.map(([status]) => (
          <Card key={status} className="h-full animate-pulse">
            <div />
          </Card>
        ))}
      </div>
    );

  if (query.error)
    return (
      <Card>
        <p className="text-sm text-red-600">{query.error.message}</p>
      </Card>
    );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col space-y-3">
      {/* Kanban Command Toolbar */}
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Kanban Board</h2>
          <p className="text-xs text-muted-foreground">
            Drag cards between columns or click to inspect details without layout shifts.
          </p>
        </div>
        <Button onClick={() => setOpenNewTask((v) => !v)}>
          <Plus className="size-4" /> New task
        </Button>
      </div>

      {/* New Task Inline Creator */}
      {openNewTask && (
        <Card className="shrink-0 p-4 border border-border/80 bg-card/80 backdrop-blur-xl animate-in fade-in duration-200">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              createTask.mutate();
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <label htmlFor="title" className="text-sm font-medium sm:col-span-2">
              Task title
              <Input
                className="mt-1.5"
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>
            <label htmlFor="task-description" className="text-sm font-medium sm:col-span-2">
              Description
              <Textarea
                className="mt-1.5"
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
              <select
                id="priority"
                className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
                value={priority}
                onChange={(event) => setPriority(event.target.value as Task["priority"])}
              >
                {Object.keys(priorityTone).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due date
              <Input
                className="mt-1.5"
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? "Creating…" : "Create task"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpenNewTask(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Kanban Column Lanes: Fixed-height flex containers with independent scroll tracks */}
      <div className="flex flex-1 min-h-0 gap-4 overflow-x-auto spatial-scrollbar pb-2">
        {grouped.map((column) => {
          const isOver = dragOverColumn === column.status;

          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: drag and drop target container
            <div
              key={column.status}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
              className={`flex w-72 sm:w-80 shrink-0 flex-col rounded-2xl border transition-colors p-3 ${
                isOver
                  ? "border-indigo-500/60 bg-indigo-950/20 ring-2 ring-indigo-500/30"
                  : "border-border/60 bg-card/40 backdrop-blur-md"
              }`}
            >
              {/* Column Header */}
              <div className="mb-3 flex shrink-0 items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{column.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Column Body: Isolated vertical scroll track */}
              <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto spatial-scrollbar pr-1">
                {column.tasks.map((task) => {
                  const isDragging = draggedTaskId === task.id;

                  return (
                    <article
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedTask(task)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedTask(task);
                        }
                      }}
                      aria-label={`Task: ${task.title}`}
                      className={`group relative cursor-grab active:cursor-grabbing transition-all rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                        isDragging ? "opacity-50 scale-98" : "hover:scale-[1.01]"
                      }`}
                    >
                      <SpotlightCard
                        className="p-3.5 border border-border/70 bg-card/70 hover:border-border backdrop-blur-md rounded-xl shadow-xs"
                        spotlightColor="rgba(99, 102, 241, 0.12)"
                      >
                        <div className="flex items-start justify-between gap-2 relative z-10">
                          <h3 className="text-xs sm:text-sm font-medium leading-snug text-foreground group-hover:text-cyan-300 transition-colors">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="size-3.5 text-muted-foreground" />
                          </div>
                        </div>

                        {task.description && (
                          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed relative z-10">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-1.5 relative z-10">
                          <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
                          {task.dueDate && (
                            <Badge tone={isOverdue(task.dueDate, task.status) ? "red" : "slate"}>
                              <CalendarDays className="mr-1 size-3" />
                              {formatDate(task.dueDate)}
                            </Badge>
                          )}
                        </div>

                        {/* Accessible fallback status mover for keyboard/screen readers */}
                        <div className="mt-2.5 pt-2 border-t border-border/40 relative z-10 flex items-center justify-between">
                          <label htmlFor={`move-select-${task.id}`} className="sr-only">
                            Move {task.title}
                          </label>
                          <select
                            id={`move-select-${task.id}`}
                            aria-label={`Move ${task.title}`}
                            className="h-7 rounded-md border border-border/60 bg-muted/50 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              moveTask.mutate({
                                taskId: task.id,
                                status: event.target.value as Task["status"],
                              });
                            }}
                          >
                            {columns.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            aria-label={`Delete ${task.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask.mutate(task.id);
                            }}
                            className="rounded-md p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </SpotlightCard>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contextual Slide-Over Task Inspector Sheet */}
      {selectedTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Inspect task ${selectedTask.title}`}
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <div
            onClick={() => setSelectedTask(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div className="relative z-10 flex h-full w-full sm:w-[480px] flex-col border-l border-border/80 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl text-foreground animate-in slide-in-from-right duration-200">
            {/* Inspector Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-cyan-400">
                  #{selectedTask.id.slice(-6).toUpperCase()}
                </span>
                <Badge tone={priorityTone[selectedTask.priority]}>{selectedTask.priority}</Badge>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground cursor-pointer transition-colors"
                aria-label="Close task inspector"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Inspector Body: Scrollable detail editor */}
            <div className="flex-1 min-h-0 overflow-y-auto spatial-scrollbar py-5 space-y-5">
              <div>
                <label
                  htmlFor="inspector-title"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Title
                </label>
                <Input
                  id="inspector-title"
                  className="mt-1.5 text-base font-semibold"
                  defaultValue={selectedTask.title}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value !== selectedTask.title) {
                      updateTask.mutate({
                        taskId: selectedTask.id,
                        patch: { title: e.target.value.trim() },
                      });
                    }
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="inspector-desc"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Description
                </label>
                <Textarea
                  id="inspector-desc"
                  className="mt-1.5 min-h-[100px] text-xs leading-relaxed"
                  defaultValue={selectedTask.description || ""}
                  placeholder="Add more details about this task..."
                  onBlur={(e) => {
                    if (e.target.value !== (selectedTask.description || "")) {
                      updateTask.mutate({
                        taskId: selectedTask.id,
                        patch: { description: e.target.value || null },
                      });
                    }
                  }}
                />
              </div>

              {/* Status & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="inspector-status"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Status
                  </label>
                  <select
                    id="inspector-status"
                    className="mt-1.5 h-9 w-full rounded-xl border border-border bg-card px-2.5 text-xs text-foreground"
                    value={selectedTask.status}
                    onChange={(e) =>
                      moveTask.mutate({
                        taskId: selectedTask.id,
                        status: e.target.value as Task["status"],
                      })
                    }
                  >
                    {columns.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inspector-priority"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Priority
                  </label>
                  <select
                    id="inspector-priority"
                    className="mt-1.5 h-9 w-full rounded-xl border border-border bg-card px-2.5 text-xs text-foreground"
                    value={selectedTask.priority}
                    onChange={(e) =>
                      updateTask.mutate({
                        taskId: selectedTask.id,
                        patch: { priority: e.target.value as Task["priority"] },
                      })
                    }
                  >
                    {Object.keys(priorityTone).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="inspector-duedate"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Due date
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <Input
                    id="inspector-duedate"
                    type="date"
                    className="h-9 text-xs"
                    defaultValue={
                      selectedTask.dueDate
                        ? new Date(selectedTask.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateTask.mutate({
                        taskId: selectedTask.id,
                        patch: { dueDate: e.target.value || null },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Inspector Footer */}
            <div className="border-t border-border/60 pt-4 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => deleteTask.mutate(selectedTask.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="size-4 mr-1.5" /> Delete task
              </Button>
              <Button onClick={() => setSelectedTask(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
