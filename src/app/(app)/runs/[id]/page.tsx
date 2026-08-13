"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Play, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/runs/status-badge";
import { useCancelRun, useExecuteRun, useRun, useRunExecution } from "@/hooks/use-runs";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiError } from "@/lib/api/problem";
import { cn, formatDateTime, formatUsd } from "@/lib/utils";

const TERMINAL = new Set(["completed", "failed", "cancelled"]);
const HAS_EXECUTION = new Set(["planning", "running", "paused", "completed", "failed"]);

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { data: run, isLoading, isError, error } = useRun(id);
  const execution = useRunExecution(id, run ? HAS_EXECUTION.has(run.status) : false);
  const executeRun = useExecuteRun(id);
  const cancelRun = useCancelRun(id);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading run…</p>;
  if (isError || !run) {
    return (
      <Card className="p-6 text-sm text-destructive">
        {error instanceof ApiError ? error.message : "Run not found."}
      </Card>
    );
  }

  const canExecute =
    run.status === "queued" && Boolean(run.workflow_id) && hasPermission("runs:execute");
  const canCancel = !TERMINAL.has(run.status) && hasPermission("runs:cancel");

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/runs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Runs
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <StatusBadge status={run.status} />
            <span className="font-mono text-xs text-muted-foreground">{run.id}</span>
          </div>
          <h1 className="truncate text-xl font-semibold tracking-tight">{run.goal}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            priority {run.priority} · created {formatDateTime(run.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {canExecute && (
            <Button onClick={() => executeRun.mutate()} disabled={executeRun.isPending}>
              <Play className="h-4 w-4" /> {executeRun.isPending ? "Executing…" : "Execute"}
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" onClick={() => cancelRun.mutate()} disabled={cancelRun.isPending}>
              <Ban className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {run.error && (
        <Card className="mb-4 border-destructive/40 p-4 text-sm text-destructive">{run.error}</Card>
      )}
      {executeRun.isError && (
        <Card className="mb-4 border-destructive/40 p-4 text-sm text-destructive">
          {executeRun.error instanceof ApiError ? executeRun.error.message : "Execution failed to start."}
        </Card>
      )}

      {(run.status === "awaiting_approval" || executeRun.data?.kind === "pending") && (
        <Card className="mb-4 border-status-approval/40 p-4">
          <p className="text-sm font-medium">This run requires approval before it executes.</p>
          {executeRun.data?.kind === "pending" && (
            <p className="mt-1 text-sm text-muted-foreground">{executeRun.data.approval.reason}</p>
          )}
          <Link href="/approvals" className="mt-2 inline-block text-sm text-accent hover:underline">
            Go to approvals
          </Link>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Execution</CardTitle>
          {execution.data && (
            <span className="font-mono text-sm">
              total <span className="text-foreground">{formatUsd(execution.data.total_cost_usd)}</span>
            </span>
          )}
        </CardHeader>
        <CardContent>
          {!HAS_EXECUTION.has(run.status) && (
            <p className="text-sm text-muted-foreground">
              {!run.workflow_id
                ? "This run has no workflow, so there is nothing to execute. Create a run against a published workflow to execute it."
                : canExecute
                  ? "This run has not executed yet. Press Execute to start it."
                  : "This run has not executed yet."}
            </p>
          )}
          {execution.isLoading && <p className="text-sm text-muted-foreground">Loading steps…</p>}
          {execution.data && <Timeline steps={execution.data.steps} />}
        </CardContent>
      </Card>
    </div>
  );
}

function Timeline({
  steps,
}: {
  steps: {
    step_id: string;
    status: string;
    cost_usd: number;
    output: Record<string, unknown> | null;
    error: string | null;
  }[];
}) {
  if (steps.length === 0) return <p className="text-sm text-muted-foreground">No steps recorded.</p>;
  return (
    <ol className="relative flex flex-col gap-4 pl-5">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const completion =
          step.output && typeof step.output.completion === "string"
            ? (step.output.completion as string)
            : null;
        return (
          <li key={step.step_id} className="relative">
            {/* connector runs from this dot to the next; the last step has none,
                so the line ends at the final dot instead of overhanging */}
            {!isLast && (
              <span
                className="absolute left-[-15px] top-[9px] h-[calc(100%+1rem)] w-px bg-border"
                aria-hidden
              />
            )}
            <span
              className={cn(
                "absolute -left-5 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card",
                step.status === "succeeded"
                  ? "bg-status-completed"
                  : step.status === "failed"
                    ? "bg-status-failed"
                    : "bg-status-cancelled",
              )}
              aria-hidden
            />
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm">{step.step_id}</span>
              <div className="flex items-center gap-3">
                <StatusBadge status={step.status} />
                {step.cost_usd > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">{formatUsd(step.cost_usd)}</span>
                )}
              </div>
            </div>
            {completion && (
              <p className="mt-1.5 rounded-md bg-muted/50 p-2.5 font-mono text-xs text-muted-foreground">
                {completion}
              </p>
            )}
            {step.error && <p className="mt-1.5 text-xs text-destructive">{step.error}</p>}
          </li>
        );
      })}
    </ol>
  );
}
