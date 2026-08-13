"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiParsed, apiRaw } from "@/lib/api/client";
import {
  ApprovalSchema,
  PagedRunsSchema,
  RunExecutionSchema,
  RunSchema,
} from "@/lib/api/schemas";
import type { CreateRunInput, ExecuteResult } from "@/lib/api/types";

export function useRuns() {
  return useQuery({
    queryKey: ["runs"],
    queryFn: () => apiParsed("/runs", PagedRunsSchema),
  });
}

export function useRun(runId: string) {
  return useQuery({
    queryKey: ["runs", runId],
    queryFn: () => apiParsed(`/runs/${runId}`, RunSchema),
    enabled: Boolean(runId),
  });
}

export function useRunExecution(runId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["runs", runId, "execution"],
    queryFn: () => apiParsed(`/runs/${runId}/execution`, RunExecutionSchema),
    enabled: enabled && Boolean(runId),
    retry: false,
  });
}

export function useCreateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRunInput) =>
      apiParsed("/runs", RunSchema, { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["runs"] }),
  });
}

export function useExecuteRun(runId: string) {
  const qc = useQueryClient();
  return useMutation<ExecuteResult, Error>({
    mutationFn: async () => {
      const { status, data } = await apiRaw(`/runs/${runId}/execute`, { method: "POST" });
      if (status === 202) {
        return { kind: "pending", approval: ApprovalSchema.parse(data) };
      }
      return { kind: "executed", execution: RunExecutionSchema.parse(data) };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs", runId] });
      qc.invalidateQueries({ queryKey: ["runs", runId, "execution"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}

export function useCancelRun(runId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiParsed(`/runs/${runId}/cancel`, RunSchema, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs"] });
      qc.invalidateQueries({ queryKey: ["runs", runId] });
    },
  });
}
