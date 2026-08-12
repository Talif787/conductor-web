// Types mirror the control-api DTOs exactly. Keep in sync with the backend.

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Me {
  user_id: string;
  tenant_id: string;
  roles: string[];
  permissions: string[];
}

export type RunStatus =
  | "queued"
  | "planning"
  | "running"
  | "paused"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export interface Run {
  id: string;
  status: RunStatus;
  goal: string;
  priority: string;
  error: string | null;
  created_at: string;
  updated_at: string;
  workflow_id: string | null;
  workflow_version: string | null;
}

export interface PagedRuns {
  runs: Run[];
  next_cursor: string | null;
}

export interface StepExecution {
  step_id: string;
  tool_id: string;
  position: number;
  status: string;
  output: Record<string, unknown> | null;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
  cost_usd: number;
}

export interface RunExecution {
  run_id: string;
  status: string;
  error: string | null;
  started_at: string;
  finished_at: string | null;
  total_cost_usd: number;
  steps: StepExecution[];
}

export interface CreateRunInput {
  goal: string;
  priority?: "low" | "normal" | "high";
  parameters?: Record<string, unknown>;
  workflow_id?: string | null;
  workflow_version?: string | null;
}
