"use client";

import { ApiError, type ProblemDetails } from "@/lib/api/problem";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/tokens";
import type { AuthTokens } from "@/lib/api/types";

const BASE = "/api/v1";

interface RequestOptions {
  method?: string;
  body?: unknown;
  // Skip the Authorization header (used by login/register/refresh).
  anonymous?: boolean;
  // Internal: prevents infinite refresh recursion.
  _retried?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        });
        if (!res.ok) return false;
        const tokens = (await res.json()) as AuthTokens;
        setTokens(tokens.access_token, tokens.refresh_token);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

// Core request: returns the HTTP status alongside the parsed body, so callers
// that care about status (e.g. execute returning 200 executed vs 202 pending
// approval) can branch on it. Handles auth, a single 401 refresh-and-retry,
// and RFC7807 error bodies.
export async function apiRaw(
  path: string,
  options: RequestOptions = {},
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (!options.anonymous) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && !options.anonymous && !options._retried) {
    const refreshed = await refreshSession();
    if (refreshed) return apiRaw(path, { ...options, _retried: true });
    clearTokens();
  }

  if (!res.ok) {
    let problem: ProblemDetails = { status: res.status, title: res.statusText };
    try {
      problem = { ...problem, ...(await res.json()) };
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, problem);
  }

  if (res.status === 204) return { status: 204, data: undefined };
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : undefined };
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { data } = await apiRaw(path, options);
  return data as T;
}

// Fetch and validate against a Zod schema, so a response-shape mismatch throws
// a clear error at the boundary instead of surfacing deep in a component.
export async function apiParsed<T>(
  path: string,
  schema: { parse: (data: unknown) => T },
  options: Parameters<typeof api>[1] = {},
): Promise<T> {
  const raw = await api<unknown>(path, options);
  return schema.parse(raw);
}
