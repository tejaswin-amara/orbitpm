import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/40 dark:border-slate-800 dark:bg-slate-950/50 dark:placeholder:text-slate-600 dark:focus:border-slate-700",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
