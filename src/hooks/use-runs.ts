"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiParsed } from "@/lib/api/client";
import {
  PagedRunsSchema,
  RunExecutionSchema,
  RunSchema,
} from "@/lib/api/schemas";
import type { CreateRunInput } from "@/lib/api/types";

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
  return useMutation({
    mutationFn: () => api<unknown>(`/runs/${runId}/execute`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs", runId] });
      qc.invalidateQueries({ queryKey: ["runs", runId, "execution"] });
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
