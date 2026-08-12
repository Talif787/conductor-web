"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiParsed } from "@/lib/api/client";
import {
  WorkflowListSchema,
  WorkflowSchema,
  WorkflowVersionSchema,
} from "@/lib/api/schemas";
import type { WorkflowStep } from "@/lib/api/types";

export function useWorkflows() {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: () => apiParsed("/workflows", WorkflowListSchema),
  });
}

export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: ["workflows", workflowId],
    queryFn: () => apiParsed(`/workflows/${workflowId}`, WorkflowSchema),
    enabled: Boolean(workflowId),
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      apiParsed("/workflows", WorkflowSchema, {
        method: "POST",
        body: { name: input.name, description: input.description ?? "" },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });
}

export function useSaveDraft(workflowId: string, version: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (steps: WorkflowStep[]) =>
      apiParsed(`/workflows/${workflowId}/versions/${version}`, WorkflowVersionSchema, {
        method: "PUT",
        body: { definition: { steps } },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows", workflowId] }),
  });
}

export function usePublishVersion(workflowId: string, version: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiParsed(
        `/workflows/${workflowId}/versions/${version}/publish`,
        WorkflowVersionSchema,
        { method: "POST" },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows", workflowId] }),
  });
}
