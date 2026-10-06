"use client";

import { ArrowLeft, KanbanSquare, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProjectBoard } from "@/components/projects/project-board";
import { ProjectComments } from "@/components/projects/project-comments";
import { SplitText } from "@/components/react-bits/SplitText";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
}

interface ProjectDetailViewProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    targetDate: Date | null;
  };
  comments: Comment[];
}

export function ProjectDetailView({ project, comments }: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"board" | "discussion">("board");

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4 sm:p-6 space-y-3">
      {/* Breadcrumb & Project Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/app/projects"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
            title="Back to projects"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                <SplitText text={project.name} />
              </h1>
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
              {project.targetDate && (
                <span className="hidden sm:inline-block text-xs text-muted-foreground">
                  Target {formatDate(project.targetDate)}
                </span>
              )}
            </div>
            {project.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("board")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "board"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <KanbanSquare className="size-3.5" />
            <span>Board</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discussion")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "discussion"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-3.5" />
            <span>Discussion ({comments.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === "board" ? (
          <ProjectBoard projectId={project.id} />
        ) : (
          <div className="h-full overflow-y-auto spatial-scrollbar max-w-3xl mx-auto py-2 pr-1">
            <ProjectComments projectId={project.id} initialComments={comments} />
          </div>
        )}
      </div>
    </div>
  );
}
