"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, GitBranch, Wrench, ShieldCheck, BarChart3, Moon, Sun, LogOut, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette, OPEN_EVENT } from "@/components/command-palette";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/runs", label: "Runs", icon: Activity, ready: true },
  { href: "/workflows", label: "Workflows", icon: GitBranch, ready: true },
  { href: "/tools", label: "Tools", icon: Wrench, ready: true },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck, ready: true },
  { href: "/insights", label: "Insights", icon: BarChart3, ready: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <CommandPalette />
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-mono text-sm font-semibold tracking-tight">conductor</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            const cls = cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
              active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60",
              !item.ready && "pointer-events-none opacity-50",
            );
            return item.ready ? (
              <Link key={item.href} href={item.href} className={cls}>
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            ) : (
              <span key={item.href} className={cls} title="Coming in a later slice">
                <Icon className="h-4 w-4" /> {item.label}
                <span className="ml-auto text-[10px] uppercase tracking-wide">soon</span>
              </span>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-5">
          <span className="text-sm text-muted-foreground">
            {user.tenant_id.slice(0, 8)} · <span className="font-mono">{user.roles.join(", ")}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
              className="hidden items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted sm:inline-flex"
              aria-label="Open command palette"
            >
              <Command className="h-3 w-3" /> K
            </button>
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.roles[0]}</span>
            <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main id="main" className="min-w-0 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Button variant="ghost" size="icon" aria-hidden />;
  const dark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
