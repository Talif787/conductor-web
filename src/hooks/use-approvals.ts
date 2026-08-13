"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiParsed } from "@/lib/api/client";
import {
  ApprovalListSchema,
  ApprovalSchema,
  RunExecutionSchema,
} from "@/lib/api/schemas";

export function useApprovals(status?: "pending" | "approved" | "rejected") {
  const query = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["approvals", status ?? "all"],
    queryFn: () => apiParsed(`/approvals${query}`, ApprovalListSchema),
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["approvals"] });
  qc.invalidateQueries({ queryKey: ["runs"] });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ approvalId, note }: { approvalId: string; note?: string }) =>
      apiParsed(`/approvals/${approvalId}/approve`, RunExecutionSchema, {
        method: "POST",
        body: note ? { note } : undefined,
      }),
    onSuccess: () => invalidate(qc),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ approvalId, note }: { approvalId: string; note?: string }) =>
      apiParsed(`/approvals/${approvalId}/reject`, ApprovalSchema, {
        method: "POST",
        body: note ? { note } : undefined,
      }),
    onSuccess: () => invalidate(qc),
  });
}
