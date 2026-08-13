"use client";

import { useQuery } from "@tanstack/react-query";
import { apiParsed } from "@/lib/api/client";
import { MemberListSchema } from "@/lib/api/schemas";

export function useMembers(enabled = true) {
  return useQuery({
    queryKey: ["members"],
    queryFn: () => apiParsed("/members", MemberListSchema),
    enabled,
  });
}
