"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutDashboard } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/app", label: "Overview", icon: LayoutDashboard },
    { href: "/app/projects", label: "Projects", icon: FolderKanban },
  ];
  return <nav className="mb-5 flex gap-2 overflow-x-auto lg:hidden">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${pathname === href || pathname.startsWith(`${href}/`) ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "glass"}`}><Icon className="size-4" />{label}</Link>)}</nav>;
}
