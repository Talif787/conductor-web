"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/runs/status-badge";
import { useWorkflows } from "@/hooks/use-workflows";
import { cn, formatDateTime } from "@/lib/utils";

export default function WorkflowsPage() {
  const { data, isLoading, isError, error } = useWorkflows();
  const workflows = data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground">Versioned DAGs your runs execute.</p>
        </div>
        <Link href="/workflows/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> New workflow
        </Link>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading workflows…</p>}
      {isError && (
        <Card className="p-6 text-sm text-destructive">
          Could not load workflows. {error instanceof Error ? error.message : ""}
        </Card>
      )}
      {!isLoading && !isError && workflows.length === 0 && (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-muted-foreground">No workflows yet.</p>
          <Link href="/workflows/new" className={buttonVariants()}>
            Create your first workflow
          </Link>
        </Card>
      )}
      {workflows.length > 0 && (
        <Card className="divide-y divide-border">
          {workflows.map((wf) => (
            <Link
              key={wf.id}
              href={`/workflows/${wf.id}`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
            >
              <StatusBadge status={wf.status} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{wf.name}</span>
              <span className="text-xs text-muted-foreground">
                {wf.versions.length} version{wf.versions.length === 1 ? "" : "s"}
              </span>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                {wf.id.slice(0, 8)}
              </span>
              <span className="hidden text-xs text-muted-foreground md:inline">
                {formatDateTime(wf.created_at)}
              </span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
