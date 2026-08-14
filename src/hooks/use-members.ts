"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiParsed } from "@/lib/api/client";
import { MemberListSchema, MemberSchema } from "@/lib/api/schemas";

export function useMembers(enabled = true) {
  return useQuery({
    queryKey: ["members"],
    queryFn: () => apiParsed("/members", MemberListSchema),
    enabled,
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string; role: string }) =>
      apiParsed("/members", MemberSchema, { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useChangeMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiParsed(`/members/${userId}`, MemberSchema, { method: "PUT", body: { role } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}
