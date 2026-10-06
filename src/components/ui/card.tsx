import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("glass rounded-2xl p-5", className)}>{children}</section>;
}
