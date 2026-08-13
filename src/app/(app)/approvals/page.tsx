"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/runs/status-badge";
import { useApprovals, useApproveRequest, useRejectRequest } from "@/hooks/use-approvals";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiError } from "@/lib/api/problem";
import type { Approval } from "@/lib/api/types";
import { cn, formatDateTime } from "@/lib/utils";

type Filter = "pending" | "approved" | "rejected";
const FILTERS: Filter[] = ["pending", "approved", "rejected"];

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const { data, isLoading, isError, error } = useApprovals(filter);
  const { hasPermission } = useAuth();
  const canApprove = hasPermission("runs:approve");
  const approvals = data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Runs held for human review before they execute.
        </p>
      </div>

      <div className="mb-4 inline-flex rounded-md border border-border p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded px-3 py-1 text-sm capitalize",
              filter === f ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading approvals…</p>}
      {isError && (
        <Card className="p-6 text-sm text-destructive">
          Could not load approvals. {error instanceof Error ? error.message : ""}
        </Card>
      )}
      {!isLoading && !isError && approvals.length === 0 && (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No {filter} approvals.
        </Card>
      )}
      {approvals.length > 0 && (
        <div className="flex flex-col gap-3">
          {approvals.map((a) => (
            <ApprovalRow key={a.id} approval={a} canApprove={canApprove} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalRow({ approval, canApprove }: { approval: Approval; canApprove: boolean }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const approve = useApproveRequest();
  const reject = useRejectRequest();
  const pending = approval.status === "pending";
  const busy = approve.isPending || reject.isPending;

  const decide = async (action: "approve" | "reject") => {
    setError(null);
    try {
      const trimmed = note.trim() || undefined;
      if (action === "approve") await approve.mutateAsync({ approvalId: approval.id, note: trimmed });
      else await reject.mutateAsync({ approvalId: approval.id, note: trimmed });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not record the decision.");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <StatusBadge status={approval.status} />
            <Link
              href={`/runs/${approval.run_id}`}
              className="font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              {approval.run_id.slice(0, 8)}
            </Link>
          </div>
          <p className="text-sm">{approval.reason}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            requested {formatDateTime(approval.requested_at)}
            {approval.decided_at ? ` · decided ${formatDateTime(approval.decided_at)}` : ""}
          </p>
          {approval.decision_note && (
            <p className="mt-1 text-xs text-muted-foreground">note: {approval.decision_note}</p>
          )}
        </div>
      </div>

      {pending && canApprove && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
            className="sm:max-w-xs"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => decide("approve")} disabled={busy}>
              {approve.isPending ? "Approving…" : "Approve"}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => decide("reject")} disabled={busy}>
              {reject.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </div>
        </div>
      )}
      {pending && !canApprove && (
        <p className="mt-2 text-xs text-muted-foreground">
          You do not have permission to decide this request.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </Card>
  );
}
