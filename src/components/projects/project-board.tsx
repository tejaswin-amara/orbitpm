"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isOverdue } from "@/lib/utils";

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

const priorityTone = { LOW: "slate", MEDIUM: "blue", HIGH: "amber", URGENT: "red" } as const;

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
  const [open, setOpen] = useState(false);

  const query = useQuery({ queryKey: ["tasks", projectId], queryFn: () => fetchTasks(projectId) });

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
      setOpen(false);
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

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete task.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const grouped = useMemo(
    () =>
      columns.map(([status, label]) => ({
        status,
        label,
        tasks: query.data?.tasks.filter((task) => task.status === status) ?? [],
      })),
    [query.data],
  );

  if (query.isLoading)
    return (
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map(([status]) => (
          <Card key={status} className="h-72 animate-pulse">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Kanban</h2>
          <p className="text-sm text-slate-500">Move work forward one explicit state at a time.</p>
        </div>
        <Button onClick={() => setOpen((value) => !value)}>
          <Plus className="size-4" /> New task
        </Button>
      </div>
      {open && (
        <Card>
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
                className="mt-2"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>
            <label htmlFor="title" className="text-sm font-medium sm:col-span-2">
              Description
              <Textarea
                className="mt-2"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <label htmlFor="dueDate" className="text-sm font-medium">
              Priority
              <select
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
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
                className="mt-2"
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? "Creating…" : "Create task"}
              </Button>
            </div>
          </form>
        </Card>
      )}
      <div className="grid gap-4 xl:grid-cols-4">
        {grouped.map((column) => (
          <div key={column.status} className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">{column.label}</div>
              <span className="text-xs text-slate-500">{column.tasks.length}</span>
            </div>
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-5">{task.title}</h3>
                    <button
                      type="button"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => deleteTask.mutate(task.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {task.description && (
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
                    {task.dueDate && (
                      <Badge tone={isOverdue(task.dueDate, task.status) ? "red" : "slate"}>
                        <CalendarDays className="mr-1 size-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <select
                      aria-label={`Move ${task.title}`}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-950"
                      value={task.status}
                      onChange={(event) =>
                        moveTask.mutate({
                          taskId: task.id,
                          status: event.target.value as Task["status"],
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
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
