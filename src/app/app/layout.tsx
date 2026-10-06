import { AppShell } from "@/components/layout/app-shell";
import { QueryProvider } from "@/components/providers/query-provider";
import { requireSession } from "@/lib/session";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <QueryProvider>
      <AppShell user={session.user}>{children}</AppShell>
    </QueryProvider>
  );
}
