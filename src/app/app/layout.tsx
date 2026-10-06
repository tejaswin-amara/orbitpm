import { MobileNav } from "@/components/app/mobile-nav";
import { Sidebar } from "@/components/app/sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { requireSession } from "@/lib/session";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <QueryProvider>
      <div className="min-h-screen lg:flex">
        <Sidebar workspaceName="OrbitPM" userName={session.user.name} />
        <main className="min-w-0 flex-1 p-5 sm:p-7">
          <MobileNav />
          {children}
        </main>
      </div>
    </QueryProvider>
  );
}
