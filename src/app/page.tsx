import { ArrowRight, CheckCircle2, KanbanSquare, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import SpotlightCard from "@/components/react-bits/SpotlightCard";

const capabilities = [
  [
    KanbanSquare,
    "Projects that stay legible",
    "A calm Kanban workflow with priorities, due dates, descriptions, and ownership.",
  ],
  [ShieldCheck, "Authorization by default", "Role checks stay on the server, not in the browser."],
  [
    Sparkles,
    "Vercel-native operations",
    "One Next.js deployment, one PostgreSQL database, previews, analytics, and automated quality gates.",
  ],
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 dark:bg-slate-950 dark:text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          OrbitPM
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl pb-20 pt-24 text-center sm:pt-32">
        <SpotlightCard
          className="mx-auto max-w-4xl custom-spotlight-card"
          spotlightColor="rgba(255, 255, 255, 0.2)"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-900 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 text-slate-200 dark:text-slate-300">
            <CheckCircle2 className="size-3.5" /> Built for focused teams
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl text-white">
            Project management without the infrastructure tax.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Projects, tasks, priorities, discussion, and delivery visibility in a single
            Vercel-native application.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row relative z-10">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-950 hover:bg-slate-200"
            >
              Create account <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              See the workflow
            </Link>
          </div>
        </SpotlightCard>
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-4 pb-20 md:grid-cols-3">
        {capabilities.map(([Icon, title, copy]) => (
          <SpotlightCard key={title} className="p-6" spotlightColor="rgba(255, 255, 255, 0.1)">
            <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 relative z-10">
              <Icon className="size-5" />
            </div>
            <h2 className="text-lg font-semibold relative z-10 text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400 relative z-10">{copy}</p>
          </SpotlightCard>
        ))}
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-slate-800">
        <span>OrbitPM · 2026</span>
        <span>Next.js · Prisma · Better Auth · Vercel</span>
      </footer>
    </main>
  );
}
