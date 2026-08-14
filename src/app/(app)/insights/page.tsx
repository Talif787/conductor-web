"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/runs/status-badge";
import { useRecentRunViews, useRunStats } from "@/hooks/use-stats";
import { cn, formatDateTime, formatUsd } from "@/lib/utils";

// Order and color for the status breakdown, aligned with the run status tokens.
const STATUS_ORDER = [
  "queued",
  "planning",
  "running",
  "awaiting_approval",
  "completed",
  "failed",
  "cancelled",
] as const;

const STATUS_BG: Record<string, string> = {
  queued: "bg-status-queued",
  planning: "bg-status-planning",
  running: "bg-status-running",
  awaiting_approval: "bg-status-approval",
  completed: "bg-status-completed",
  failed: "bg-status-failed",
  cancelled: "bg-status-cancelled",
};

const LABEL: Record<string, string> = {
  queued: "Queued",
  planning: "Planning",
  running: "Running",
  awaiting_approval: "Awaiting approval",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export default function InsightsPage() {
  const stats = useRunStats();
  const recent = useRecentRunViews(25);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Run activity across your workspace, from the read model.
        </p>
      </div>

      {stats.isError && (
        <Card className="mb-6 p-6 text-sm text-destructive">
          Could not load stats. {stats.error instanceof Error ? stats.error.message : ""}
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total runs" value={stats.data?.total} loading={stats.isLoading} />
        <Metric label="Active" value={stats.data?.active} loading={stats.isLoading} />
        <Metric
          label="Completed"
          value={stats.data?.by_status.completed ?? 0}
          loading={stats.isLoading}
        />
        <Metric label="Failed" value={stats.data?.by_status.failed ?? 0} loading={stats.isLoading} />
      </div>

      {stats.data && (
        <Card className="mb-6 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total cost</p>
          <p className="mt-1 font-mono text-2xl font-semibold">
            {formatUsd(stats.data.total_cost_usd)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aggregate LLM spend across this workspace.
          </p>
        </Card>
      )}

      {stats.data && stats.data.total > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>By status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBar byStatus={stats.data.by_status} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {recent.isError && (
            <p className="text-sm text-destructive">Could not load recent runs.</p>
          )}
          {recent.data && recent.data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No runs recorded yet. Activity appears here once runs are created and the projection
              is populated.
            </p>
          )}
          {recent.data && recent.data.length > 0 && (
            <div className="divide-y divide-border">
              {recent.data.map((v) => (
                <Link
                  key={v.run_id}
                  href={`/runs/${v.run_id}`}
                  className="flex items-center gap-4 py-2.5 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
                >
                  <StatusBadge status={v.status} />
                  <span className="min-w-0 flex-1 truncate text-sm">{v.goal}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {v.event_count} event{v.event_count === 1 ? "" : "s"}
                  </span>
                  <span className="hidden text-xs text-muted-foreground md:inline">
                    {formatDateTime(v.updated_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold">
        {loading ? <span className="text-muted-foreground">--</span> : (value ?? 0)}
      </p>
    </Card>
  );
}

function StatusBar({ byStatus }: { byStatus: Record<string, number> }) {
  const entries: { status: string; count: number }[] = STATUS_ORDER.filter(
    (s) => (byStatus[s] ?? 0) > 0,
  ).map((s) => ({ status: s as string, count: byStatus[s] }));
  // include any status the backend reports that we do not have an explicit order for
  for (const [status, count] of Object.entries(byStatus)) {
    if (count > 0 && !STATUS_ORDER.includes(status as (typeof STATUS_ORDER)[number])) {
      entries.push({ status, count });
    }
  }
  const sum = entries.reduce((acc, e) => acc + e.count, 0);
  if (sum === 0) return <p className="text-sm text-muted-foreground">No runs yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {entries.map((e) => (
          <div
            key={e.status}
            className={cn(STATUS_BG[e.status] ?? "bg-status-queued")}
            style={{ width: `${(e.count / sum) * 100}%` }}
            title={`${LABEL[e.status] ?? e.status}: ${e.count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {entries.map((e) => (
          <span key={e.status} className="inline-flex items-center gap-1.5 text-xs">
            <span className={cn("h-2 w-2 rounded-full", STATUS_BG[e.status] ?? "bg-status-queued")} />
            <span className="text-muted-foreground">{LABEL[e.status] ?? e.status}</span>
            <span className="font-mono">{e.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
