"use client";

import { FolderKanban, LayoutDashboard, Menu, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNavContent, MobileSheet } from "@/components/layout/mobile-sheet";
import { UserNav } from "@/components/layout/user-nav";
import { cn } from "@/lib/utils";

export interface WorkspaceDockUser {
  name: string;
  email?: string;
  image?: string | null;
}

export interface WorkspaceDockProps {
  user: WorkspaceDockUser;
  projectName?: string;
  isAssistantOpen?: boolean;
  onToggleAssistant?: () => void;
  className?: string;
}

export function WorkspaceDock({
  user,
  projectName,
  onToggleAssistant,
  className,
}: WorkspaceDockProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onToggleAssistant?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleAssistant]);

  const isProjectDetail = pathname.startsWith("/app/projects/") && pathname !== "/app/projects";
  const isOverview = pathname === "/app";
  const isProjects = pathname.startsWith("/app/projects");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-border/80 bg-card/80 px-4 backdrop-blur-xl transition-colors sm:px-6",
          className,
        )}
      >
        {/* Left: Mobile Trigger, Brand Mark, Navigation Tabs / Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/70 hover:text-foreground md:hidden cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <Menu className="size-4" />
          </button>

          <Link href="/app" className="group flex items-center gap-2.5">
            <div className="relative flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-sm shadow-indigo-500/20">
              <span className="size-2 rounded-full bg-white ring-2 ring-white/50 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">OrbitPM</span>
          </Link>

          <span className="hidden text-muted-foreground/40 sm:inline">/</span>

          {/* Desktop Navigation / Breadcrumbs */}
          <nav className="hidden items-center gap-1 md:flex">
            {isProjectDetail ? (
              <div className="flex items-center gap-2 text-xs">
                <Link
                  href="/app/projects"
                  className="font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Projects
                </Link>
                <span className="text-muted-foreground/40">›</span>
                <span className="max-w-[180px] truncate font-semibold text-foreground">
                  {projectName || "Workspace"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border/40">
                <Link
                  href="/app"
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                    isOverview
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <LayoutDashboard className="size-3.5" />
                  Overview
                </Link>
                <Link
                  href="/app/projects"
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                    isProjects && !isProjectDetail
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <FolderKanban className="size-3.5" />
                  Projects
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Center: AI Assistant / Command Bar Trigger */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => onToggleAssistant?.()}
            className="group flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground shadow-xs transition-all hover:border-border hover:bg-muted/60 hover:text-foreground sm:w-64 sm:justify-between cursor-pointer"
            aria-label="Ask Orbit or search tasks (Cmd+K)"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-cyan-400 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Ask Orbit or filter...</span>
              <span className="sm:hidden">Ask Orbit</span>
            </div>
            <kbd className="hidden rounded bg-muted/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/60 sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action, Session Indicator, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/app/projects"
            className="hidden items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted/50 sm:inline-flex"
          >
            <Plus className="size-3.5" />
            <span>New Project</span>
          </Link>

          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 lg:flex">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live</span>
          </div>

          <UserNav user={user} />
        </div>
      </header>

      {/* Responsive Mobile Drawer */}
      <MobileSheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        side="left"
        title="Navigation"
      >
        <MobileNavContent
          user={user}
          onClose={() => setMobileMenuOpen(false)}
          onToggleAssistant={onToggleAssistant}
        />
      </MobileSheet>
    </>
  );
}
