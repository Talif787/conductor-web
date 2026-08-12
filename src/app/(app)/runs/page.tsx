"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/runs/status-badge";
import { useRuns } from "@/hooks/use-runs";
import { cn, formatDateTime } from "@/lib/utils";

export default function RunsPage() {
  const { data, isLoading, isError, error } = useRuns();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Runs</h1>
          <p className="text-sm text-muted-foreground">Executions of your agentic workflows.</p>
        </div>
        <Link href="/runs/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> New run
        </Link>
      </div>

      {isLoading && <SkeletonList />}
      {isError && (
        <Card className="p-6 text-sm text-destructive">
          Could not load runs. {error instanceof Error ? error.message : ""}
        </Card>
      )}
      {data && data.runs.length === 0 && (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-muted-foreground">No runs yet. Start one to see it here.</p>
          <Link href="/runs/new" className={buttonVariants()}>
            Create your first run
          </Link>
        </Card>
      )}
      {data && data.runs.length > 0 && (
        <Card className="divide-y divide-border">
          {data.runs.map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
            >
              <StatusBadge status={run.status} />
              <span className="min-w-0 flex-1 truncate text-sm">{run.goal}</span>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                {run.id.slice(0, 8)}
              </span>
              <span className="text-xs text-muted-foreground">{formatDateTime(run.created_at)}</span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <Card className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </Card>
  );
}
