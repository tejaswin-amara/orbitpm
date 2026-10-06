import { ArrowRight, CheckCircle2, KanbanSquare, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { MagneticButton } from "@/components/react-bits/MagneticButton";
import { ParticlesBackground } from "@/components/react-bits/ParticlesBackground";
import { SplitText } from "@/components/react-bits/SplitText";
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
    <div className="h-full w-full overflow-hidden flex flex-col bg-background text-foreground relative">
      {/* Ambient React Bits Particles Background */}
      <ParticlesBackground className="opacity-70" />

      {/* Fixed top navigation bar */}
      <header className="h-14 shrink-0 border-b border-border/60 bg-card/70 backdrop-blur-xl z-20">
        <nav
          aria-label="Main Navigation"
          className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-sm shadow-indigo-500/20">
              <span className="size-2 rounded-full bg-white ring-2 ring-white/50" />
            </div>
            <span>OrbitPM</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-foreground px-3.5 py-1.5 text-xs sm:text-sm font-medium text-background hover:bg-foreground/90 transition-colors shadow-xs"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main spatial content canvas: scrollable on small screens, neatly fitted on 1080p+ */}
      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden spatial-scrollbar flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 py-2">
          {/* Hero Section */}
          <section className="text-center">
            <SpotlightCard
              className="custom-spotlight-card border border-border/80 bg-card/60 p-6 sm:p-8 shadow-xl backdrop-blur-xl"
              spotlightColor="rgba(99, 102, 241, 0.18)"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orbit-indigo/30 bg-orbit-indigo/10 px-3 py-1 text-xs font-medium text-cyan-300">
                <CheckCircle2 className="size-3.5 text-cyan-400" />
                <span>Built for focused teams</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                <SplitText text="Project management without the infrastructure tax." />
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
                Projects, tasks, priorities, discussion, and delivery visibility in a single
                Vercel-native application.
              </p>
              <div className="mt-6 flex flex-col justify-center items-center gap-3 sm:flex-row relative z-10">
                <Link href="/sign-up">
                  <MagneticButton className="gap-2 rounded-xl bg-foreground px-5 py-2.5 text-xs sm:text-sm font-medium text-background hover:bg-foreground/90 transition-colors shadow-md">
                    Create account <ArrowRight className="size-4" />
                  </MagneticButton>
                </Link>
                <Link href="#features">
                  <MagneticButton className="rounded-xl border border-border/80 bg-muted/40 px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 transition-colors">
                    See the workflow
                  </MagneticButton>
                </Link>
              </div>
            </SpotlightCard>
          </section>

          {/* Features Grid */}
          <section id="features" className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {capabilities.map(([Icon, title, copy]) => (
              <SpotlightCard
                key={title}
                className="border border-border/60 bg-card/50 p-5 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-0.5"
                spotlightColor="rgba(255, 255, 255, 0.08)"
              >
                <div className="mb-3.5 flex size-10 items-center justify-center rounded-xl bg-muted border border-border/60 text-foreground relative z-10 shadow-xs">
                  <Icon className="size-4 text-cyan-400" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-foreground relative z-10">
                  {title}
                </h2>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed relative z-10">
                  {copy}
                </p>
              </SpotlightCard>
            ))}
          </section>
        </div>
      </main>

      {/* Fixed bottom footer */}
      <footer className="h-10 shrink-0 border-t border-border/40 px-4 sm:px-8 flex items-center justify-between text-xs text-muted-foreground bg-card/40 backdrop-blur-sm z-20">
        <span className="font-medium">OrbitPM · 2026</span>
        <span className="hidden sm:inline">Next.js · Prisma · Better Auth · Vercel</span>
      </footer>
    </div>
  );
}
