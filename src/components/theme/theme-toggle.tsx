"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

export interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (variant === "pill") {
      return (
        <div
          className={cn(
            "inline-flex items-center rounded-xl border border-border/60 bg-muted/40 p-1 text-xs",
            className,
          )}
          aria-hidden="true"
        >
          <span className="px-2.5 py-1 text-muted-foreground opacity-60">Theme</span>
        </div>
      );
    }
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          "flex size-8 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground",
          className,
        )}
      >
        <span className="size-4" />
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <fieldset
        className={cn(
          "inline-flex items-center rounded-xl border border-border/60 bg-muted/40 p-1 text-xs border-0 m-0",
          className,
        )}
        aria-label="Select color theme"
      >
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer",
            theme === "dark"
              ? "bg-foreground text-background font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={theme === "dark"}
        >
          <Moon className="size-3.5" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer",
            theme === "light"
              ? "bg-foreground text-background font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={theme === "light"}
        >
          <Sun className="size-3.5" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer",
            theme === "system"
              ? "bg-foreground text-background font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={theme === "system"}
        >
          <Laptop className="size-3.5" />
          <span>Auto</span>
        </button>
      </fieldset>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      className={cn(
        "group relative flex size-8 items-center justify-center rounded-xl border border-border/70 bg-card/80 text-muted-foreground transition-all hover:border-border hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer shadow-xs",
        className,
      )}
      aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4 text-amber-400 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-indigo-500 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
