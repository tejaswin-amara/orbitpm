"use client";

import { CornerDownLeft, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ProjectHealthCard,
  SprintSummaryCard,
  TaskListCard,
  TaskPreviewCard,
} from "./generative-cards";
import { parseAssistantIntent } from "./intent-parser";
import type {
  ParsedAssistantIntent,
  ProjectHealthData,
  SprintSummaryData,
  TaskPreviewData,
} from "./types";

interface OrbitAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export function OrbitAssistantModal({
  open,
  onOpenChange,
  onTaskCreated,
}: OrbitAssistantModalProps) {
  const [query, setQuery] = useState("");
  const [activeIntent, setActiveIntent] = useState<ParsedAssistantIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setActiveIntent(null);
      setLoading(false);
    }
  }, [open]);

  // Handle ESC
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const parsed = parseAssistantIntent(query);

    // Simulate micro-delay for realistic conversational reasoning
    setTimeout(() => {
      setActiveIntent(parsed);
      setLoading(false);
    }, 250);
  };

  const handleSuggestionClick = (prompt: string) => {
    setQuery(prompt);
    setLoading(true);
    const parsed = parseAssistantIntent(prompt);
    setTimeout(() => {
      setActiveIntent(parsed);
      setLoading(false);
    }, 200);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Orbit AI Assistant"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:pt-20"
    >
      {/* Backdrop */}
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-indigo-500/30 bg-card/95 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col text-foreground animate-in fade-in zoom-in-95 duration-200">
        {/* Input Header */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-b border-border/60 px-4 py-3"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-sm shadow-indigo-500/30">
            <Sparkles className="size-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Orbit AI: 'Summarize sprint', 'Create urgent task...', 'Check health'..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-hidden"
          />
          <button
            type="submit"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground cursor-pointer transition-colors"
            title="Execute query"
          >
            <CornerDownLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground cursor-pointer transition-colors"
            aria-label="Close assistant"
          >
            <X className="size-4" />
          </button>
        </form>

        {/* Suggestion Chips */}
        {!activeIntent && !loading && (
          <div className="p-4 space-y-3">
            <div className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
              Suggested Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Summarize sprint delivery",
                "Check project health & risks",
                "Create urgent task: Audit auth tokens",
                "Show overdue tasks",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSuggestionClick(chip)}
                  className="rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:border-cyan-500/40 hover:text-foreground transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="p-8 text-center space-y-2">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p className="text-xs text-muted-foreground">Reasoning over project intelligence...</p>
          </div>
        )}

        {/* Dynamic Generative Card Results */}
        {activeIntent && !loading && (
          <div className="p-4 max-h-[70vh] overflow-y-auto spatial-scrollbar space-y-3">
            <div className="text-xs text-muted-foreground font-medium">{activeIntent.summary}</div>

            {activeIntent.type === "SUMMARIZE_SPRINT" && (
              <SprintSummaryCard
                data={
                  {
                    totalTasks: 18,
                    completedTasks: 11,
                    inProgressTasks: 4,
                    reviewTasks: 2,
                    todoTasks: 1,
                    overdueTasks: 0,
                    completionRate: 61,
                    velocityScore: 84,
                    narrative:
                      "Sprint execution is pacing ahead of schedule with 61% delivery completed. Review lane has zero blocked PRs.",
                    blockers: [],
                  } as SprintSummaryData
                }
              />
            )}

            {activeIntent.type === "PROJECT_HEALTH" && (
              <ProjectHealthCard
                data={
                  {
                    healthScore: 88,
                    status: "OPTIMAL",
                    riskFactors: ["1 task approaching target milestone due date in 48 hours"],
                    recommendations: [
                      "Complete QA review pass on responsive Kanban columns",
                      "Verify auth refresh token rotation in production staging",
                    ],
                  } as ProjectHealthData
                }
              />
            )}

            {activeIntent.type === "CREATE_TASK" && (
              <TaskPreviewCard
                data={
                  {
                    title: activeIntent.params.taskTitle || "New task",
                    priority: activeIntent.params.taskPriority || "MEDIUM",
                    description: "Generatively parsed from conversational assistant.",
                  } as TaskPreviewData
                }
                onConfirm={() => {
                  onTaskCreated?.();
                  onOpenChange(false);
                }}
              />
            )}

            {activeIntent.type === "FILTER_TASKS" && (
              <TaskListCard
                tasks={[
                  {
                    id: "task-1",
                    title: "Audit JWT auth token rotation",
                    priority: "URGENT",
                    status: "IN_PROGRESS",
                  },
                  {
                    id: "task-2",
                    title: "Zero-scroll viewport regression verification",
                    priority: "HIGH",
                    status: "DONE",
                  },
                ]}
              />
            )}

            {activeIntent.type === "GENERAL_QUERY" && (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
                OrbitPM is maintaining all delivery milestones inside a strict zero-scroll spatial
                architecture. Use{" "}
                <kbd className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border/60">
                  Cmd+K
                </kbd>{" "}
                anytime to query project state.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border/40 bg-card/40 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Orbit Intelligence Engine</span>
          <div className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
