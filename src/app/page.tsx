import { ArrowRight, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MagneticButton } from "@/components/react-bits/MagneticButton";
import { ParticlesBackground } from "@/components/react-bits/ParticlesBackground";
import { SplitText } from "@/components/react-bits/SplitText";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
            aria-label="OrbitPM - Origins"
            className="flex items-center gap-2.5 text-base font-bold tracking-wider text-foreground uppercase"
          >
            <Image
              src="/origins-logo-dark.webp"
              alt="Origins Logo"
              width={28}
              height={28}
              priority
              className="hidden dark:block size-7 object-contain"
            />
            <Image
              src="/origins-logo-light.png"
              alt="Origins Logo"
              width={28}
              height={28}
              priority
              className="block dark:hidden size-7 object-contain"
            />
            <span>Origins</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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

      {/* Main spatial content canvas: zero-scroll, contained internal tool hero */}
      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden spatial-scrollbar flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center items-center py-2">
          <SpotlightCard
            className="w-full custom-spotlight-card border border-border/80 bg-card/60 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center rounded-2xl"
            spotlightColor="rgba(99, 102, 241, 0.18)"
          >
            {/* Internal Access Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1 text-xs font-semibold tracking-wide text-muted-foreground">
              <Lock className="size-3 text-cyan-600 dark:text-cyan-400" />
              <span>Internal Operations Workspace</span>
            </div>

            {/* Company Logo Display */}
            <div className="mb-6 flex justify-center items-center">
              <Image
                src="/origins-logo-dark.webp"
                alt="Origins - Rise • Conquer • Evolve"
                width={160}
                height={200}
                priority
                className="hidden dark:block h-28 sm:h-36 w-auto object-contain drop-shadow-xl"
              />
              <Image
                src="/origins-logo-light.png"
                alt="Origins - Rise • Conquer • Evolve"
                width={200}
                height={200}
                priority
                className="block dark:hidden h-28 sm:h-36 w-auto object-contain drop-shadow-md"
              />
            </div>

            {/* Typography Heading & Tagline */}
            <h1
              aria-label="Origins"
              className="text-3xl sm:text-4xl font-black tracking-widest uppercase text-foreground leading-tight"
            >
              <SplitText text="ORIGINS" />
            </h1>
            <p className="mt-2 text-xs sm:text-sm font-bold tracking-[0.25em] text-muted-foreground uppercase">
              Rise • Conquer • Evolve
            </p>

            <p className="mx-auto mt-4 max-w-md text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
              Internal project management, operations tracking, and mission-critical execution.
            </p>

            {/* Workspace Entry Actions */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 relative z-10">
              <Link href="/app" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto gap-2 rounded-xl bg-foreground px-6 py-2.5 text-xs sm:text-sm font-semibold text-background hover:bg-foreground/90 transition-colors shadow-md">
                  Enter Workspace <ArrowRight className="size-4" />
                </MagneticButton>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto rounded-xl border border-border/80 bg-muted/40 px-6 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 transition-colors">
                  Access Portal
                </MagneticButton>
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </main>

      {/* Fixed bottom footer */}
      <footer className="h-10 shrink-0 border-t border-border/40 px-4 sm:px-8 flex items-center justify-between text-xs text-muted-foreground bg-card/40 backdrop-blur-sm z-20">
        <span className="font-medium">Origins Internal Portal · 2026</span>
        <span className="hidden sm:inline">Authorized Personnel Only</span>
      </footer>
    </div>
  );
}
