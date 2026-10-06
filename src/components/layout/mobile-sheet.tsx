"use client";

import { FolderKanban, LayoutDashboard, LogOut, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "bottom";
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function MobileSheet({
  open,
  onOpenChange,
  side = "left",
  title = "Menu",
  children,
  className,
}: MobileSheetProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  const sideClasses = {
    left: "top-0 left-0 h-full w-80 max-w-[85vw] border-r border-border/80 translate-x-0 animate-in slide-in-from-left duration-200",
    right:
      "top-0 right-0 h-full w-80 max-w-[85vw] border-l border-border/80 translate-x-0 animate-in slide-in-from-right duration-200",
    bottom:
      "bottom-0 inset-x-0 max-h-[85vh] rounded-t-2xl border-t border-border/80 translate-y-0 animate-in slide-in-from-bottom duration-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-default border-none p-0 w-full h-full"
        aria-label="Close sheet overlay"
      />

      {/* Drawer Container */}
      <div
        className={cn(
          "relative z-10 flex flex-col bg-card/95 p-5 shadow-2xl backdrop-blur-2xl text-foreground",
          sideClasses[side],
          className,
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <Image
              src="/origins-logo.png"
              alt="Origins Logo"
              width={24}
              height={24}
              className="dark:invert size-6 object-contain"
            />
            <span className="font-bold text-sm tracking-wider uppercase">Origins</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground cursor-pointer"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 spatial-scrollbar">{children}</div>
      </div>
    </div>
  );
}

export function MobileNavContent({
  user,
  onClose,
  onToggleAssistant,
}: {
  user: { name: string; email?: string; image?: string | null };
  onClose: () => void;
  onToggleAssistant?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { href: "/app", label: "Overview", icon: LayoutDashboard },
    { href: "/app/projects", label: "Projects", icon: FolderKanban },
  ];

  async function handleSignOut() {
    setLoggingOut(true);
    await authClient.signOut();
    onClose();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-4">
        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/app" ? pathname === "/app" : pathname.startsWith("/app/projects");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Quick Trigger */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onToggleAssistant?.();
          }}
          className="flex w-full items-center justify-between rounded-xl border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground hover:border-cyan-500/40 hover:text-foreground transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="size-4 text-cyan-400" />
            <span>Ask Orbit Assistant</span>
          </div>
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        {/* Theme Preference */}
        <div className="pt-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Theme</p>
          <ThemeToggle variant="pill" className="w-full justify-between" />
        </div>
      </div>

      {/* User Session Footer */}
      <div className="border-t border-border/60 pt-4">
        <div className="mb-4 flex items-center gap-3 px-1">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            {user.name
              ? user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "OP"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {user.email || "Active Member"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span>{loggingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
}
