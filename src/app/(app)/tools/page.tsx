"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTools } from "@/hooks/use-tools";
import { cn, formatDateTime } from "@/lib/utils";

const KIND_LABEL: Record<string, string> = { builtin: "Builtin", http: "HTTP", mcp: "MCP" };

export default function ToolsPage() {
  const { data, isLoading, isError, error } = useTools();
  const tools = data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tools</h1>
          <p className="text-sm text-muted-foreground">Capabilities your workflows can invoke.</p>
        </div>
        <Link href="/tools/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> Register tool
        </Link>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading tools…</p>}
      {isError && (
        <Card className="p-6 text-sm text-destructive">
          Could not load tools. {error instanceof Error ? error.message : ""}
        </Card>
      )}
      {!isLoading && !isError && tools.length === 0 && (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-muted-foreground">No tools yet.</p>
          <Link href="/tools/new" className={buttonVariants()}>
            Register your first tool
          </Link>
        </Card>
      )}
      {tools.length > 0 && (
        <Card className="divide-y divide-border">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center gap-4 px-5 py-3.5">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium">
                {KIND_LABEL[tool.kind] ?? tool.kind}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{tool.name}</span>
              <span className="hidden max-w-xs truncate text-xs text-muted-foreground md:inline">
                {tool.description}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{tool.id.slice(0, 8)}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {formatDateTime(tool.created_at)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
