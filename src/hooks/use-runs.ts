"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { CreateRunInput, PagedRuns, Run, RunExecution } from "@/lib/api/types";

export function useRuns() {
  return useQuery({
    queryKey: ["runs"],
    queryFn: () => api<PagedRuns>("/runs"),
  });
}

export function useRun(runId: string) {
  return useQuery({
    queryKey: ["runs", runId],
    queryFn: () => api<Run>(`/runs/${runId}`),
    enabled: Boolean(runId),
  });
}

export function useRunExecution(runId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["runs", runId, "execution"],
    queryFn: () => api<RunExecution>(`/runs/${runId}/execution`),
    enabled: enabled && Boolean(runId),
    retry: false,
  });
}

export function useCreateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRunInput) => api<Run>("/runs", { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["runs"] }),
  });
}

export function useExecuteRun(runId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<RunExecution>(`/runs/${runId}/execute`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs", runId] });
      qc.invalidateQueries({ queryKey: ["runs", runId, "execution"] });
    },
  });
}

export function useCancelRun(runId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<Run>(`/runs/${runId}/cancel`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs"] });
      qc.invalidateQueries({ queryKey: ["runs", runId] });
    },
  });
}
