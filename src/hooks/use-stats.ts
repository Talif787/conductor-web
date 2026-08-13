"use client";

import { useQuery } from "@tanstack/react-query";
import { apiParsed } from "@/lib/api/client";
import { RunStatsSchema, RunViewListSchema } from "@/lib/api/schemas";

export function useRunStats() {
  return useQuery({
    queryKey: ["stats", "runs"],
    queryFn: () => apiParsed("/stats/runs", RunStatsSchema),
  });
}

export function useRecentRunViews(limit = 25) {
  return useQuery({
    queryKey: ["stats", "recent", limit],
    queryFn: () => apiParsed(`/stats/runs/recent?limit=${limit}`, RunViewListSchema),
  });
}
