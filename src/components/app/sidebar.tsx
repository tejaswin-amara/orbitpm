"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function Sidebar({ workspaceName, userName }: { workspaceName: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = [
    { href: "/app", label: "Overview", icon: LayoutDashboard },
    { href: "/app/projects", label: "Projects", icon: FolderKanban },
  ];

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200/70 bg-white/40 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/30 lg:block">
      <div className="flex h-full flex-col">
        <div className="px-2 py-3">
          <div className="text-sm font-semibold">OrbitPM</div>
          <div className="mt-1 truncate text-xs text-slate-500">{workspaceName}</div>
        </div>
        <nav className="mt-5 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"}`}><Icon className="size-4" />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto border-t border-slate-200/70 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between px-2">
            <div className="min-w-0"><div className="truncate text-sm font-medium">{userName}</div><div className="text-xs text-slate-500">Member</div></div>
            <button type="button" title="Sign out" onClick={signOut} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"><LogOut className="size-4" /></button>
          </div>
        </div>
      </div>
    </aside>
  );
}
