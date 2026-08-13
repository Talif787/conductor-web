"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Activity,
  BarChart3,
  GitBranch,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  group: string;
  keywords: string;
  icon: LucideIcon;
  run: () => void;
}

// Dispatched by the top-bar hint button so the palette can open from a click.
export const OPEN_EVENT = "conductor:command-palette";

export function CommandPalette() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      { id: "runs", label: "Go to Runs", group: "Navigate", keywords: "runs executions", icon: Activity, run: go("/runs") },
      { id: "workflows", label: "Go to Workflows", group: "Navigate", keywords: "workflows dag", icon: GitBranch, run: go("/workflows") },
      { id: "tools", label: "Go to Tools", group: "Navigate", keywords: "tools registry", icon: Wrench, run: go("/tools") },
      { id: "approvals", label: "Go to Approvals", group: "Navigate", keywords: "approvals governance", icon: ShieldCheck, run: go("/approvals") },
      { id: "insights", label: "Go to Insights", group: "Navigate", keywords: "insights stats dashboard", icon: BarChart3, run: go("/insights") },
      { id: "new-run", label: "New run", group: "Create", keywords: "create run execute", icon: Plus, run: go("/runs/new") },
      { id: "new-workflow", label: "New workflow", group: "Create", keywords: "create workflow", icon: Plus, run: go("/workflows/new") },
      { id: "new-tool", label: "Register tool", group: "Create", keywords: "create tool register", icon: Plus, run: go("/tools/new") },
      {
        id: "theme",
        label: "Toggle theme",
        group: "Preferences",
        keywords: "dark light theme",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];
  }, [router, resolvedTheme, setTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q),
    );
  }, [commands, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  // Global open triggers: Cmd/Ctrl+K, and a click-dispatched custom event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setActive(0);
      // focus the input after the panel mounts
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const activeIndex = Math.min(active, Math.max(0, filtered.length - 1));

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) {
        close();
        cmd.run();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/60 pt-[15vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onListKey}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or search…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Command"
        />
        <ul className="max-h-80 overflow-auto p-1.5">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No commands.</li>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            const isActive = i === activeIndex;
            return (
              <li key={cmd.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    close();
                    cmd.run();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-foreground">{cmd.label}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {cmd.group}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
