import { ParticlesBackground } from "@/components/react-bits/ParticlesBackground";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative grid h-screen w-screen place-items-center overflow-hidden px-4 py-6 bg-background text-foreground">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <ParticlesBackground className="opacity-50" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
