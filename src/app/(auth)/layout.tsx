import { ParticlesBackground } from "@/components/react-bits/ParticlesBackground";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative grid h-screen w-screen place-items-center overflow-hidden px-4 py-6 bg-background text-foreground">
      <ParticlesBackground className="opacity-50" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
