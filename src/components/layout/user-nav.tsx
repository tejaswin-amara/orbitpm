"use client";

import { ChevronDown, FolderKanban, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface UserNavProps {
  user: {
    name: string;
    email?: string;
    image?: string | null;
  };
  className?: string;
}

export function UserNav({ user, className }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "OP";

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={menuRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User account menu"
      >
        <div className="relative">
          {user.image ? (
            // biome-ignore lint/performance/noImgElement: dynamic user avatar url from OAuth provider
            <img
              src={user.image}
              alt={user.name}
              className="size-7 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300">
              {initials}
            </div>
          )}
          <span
            className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card"
            title="Online session"
          />
        </div>
        <span className="hidden max-w-[120px] truncate text-xs font-medium text-foreground sm:inline-block">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown className="hidden size-3 text-muted-foreground sm:inline-block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-56 origin-top-right rounded-2xl border border-border/80 bg-card/95 p-2 shadow-xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Details Header */}
          <div className="px-3 py-2 border-b border-border/60">
            <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.email || "Active Member"}
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <ShieldCheck className="size-3" />
              <span>Session Authenticated</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              role="menuitem"
            >
              <LayoutDashboard className="size-3.5" />
              <span>Overview</span>
            </Link>
            <Link
              href="/app/projects"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              role="menuitem"
            >
              <FolderKanban className="size-3.5" />
              <span>Projects</span>
            </Link>
          </div>

          {/* Theme Selector */}
          <div className="border-t border-border/60 px-3 py-2">
            <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Theme
            </p>
            <ThemeToggle variant="pill" className="w-full justify-between" />
          </div>

          {/* Sign Out */}
          <div className="border-t border-border/60 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
              role="menuitem"
            >
              <LogOut className="size-3.5" />
              <span>{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
