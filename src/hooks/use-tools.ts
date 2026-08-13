"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiParsed } from "@/lib/api/client";
import { ToolListSchema, ToolSchema } from "@/lib/api/schemas";
import type { RegisterToolInput } from "@/lib/api/types";

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: () => apiParsed("/tools", ToolListSchema),
  });
}

export function useRegisterTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterToolInput) =>
      apiParsed("/tools", ToolSchema, {
        method: "POST",
        body: {
          name: input.name,
          kind: input.kind,
          description: input.description ?? "",
          input_schema: input.input_schema ?? {},
          output_schema: input.output_schema ?? {},
          config: input.config ?? {},
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools"] }),
  });
}
