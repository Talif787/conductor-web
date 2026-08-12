import { cn } from "@/lib/utils";
import type { RunStatus } from "@/lib/api/types";

const LABELS: Record<string, string> = {
  queued: "Queued",
  planning: "Planning",
  running: "Running",
  paused: "Paused",
  awaiting_approval: "Awaiting approval",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  succeeded: "Succeeded",
  skipped: "Skipped",
  pending: "Pending",
};

const DOT: Record<string, string> = {
  queued: "bg-status-queued",
  planning: "bg-status-planning",
  running: "bg-status-running",
  awaiting_approval: "bg-status-approval",
  completed: "bg-status-completed",
  succeeded: "bg-status-completed",
  failed: "bg-status-failed",
  cancelled: "bg-status-cancelled",
  skipped: "bg-status-cancelled",
  pending: "bg-status-queued",
  paused: "bg-status-queued",
};

export function StatusBadge({ status, className }: { status: RunStatus | string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[status] ?? "bg-status-queued")} aria-hidden />
      {LABELS[status] ?? status}
    </span>
  );
}
