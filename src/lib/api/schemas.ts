import { z } from "zod";

export const AuthTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export const MeSchema = z.object({
  user_id: z.string(),
  tenant_id: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});

// status is left as a string on purpose: the backend can add states without
// breaking the client. The UI maps known values and falls back gracefully.
export const RunSchema = z.object({
  id: z.string(),
  status: z.string(),
  goal: z.string(),
  priority: z.string(),
  error: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  workflow_id: z.string().nullable().optional(),
  workflow_version: z.string().nullable().optional(),
});

export const PagedRunsSchema = z.object({
  items: z.array(RunSchema),
  next_cursor: z.string().nullable(),
});

export const StepExecutionSchema = z.object({
  step_id: z.string(),
  tool_id: z.string(),
  position: z.number(),
  status: z.string(),
  output: z.record(z.unknown()).nullable(),
  error: z.string().nullable(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  cost_usd: z.number(),
});

export const RunExecutionSchema = z.object({
  run_id: z.string(),
  status: z.string(),
  error: z.string().nullable(),
  started_at: z.string(),
  finished_at: z.string().nullable(),
  total_cost_usd: z.number(),
  steps: z.array(StepExecutionSchema),
});

export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  kind: z.string(),
  input_schema: z.record(z.unknown()),
  output_schema: z.record(z.unknown()),
  config: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});
export const ToolListSchema = z.array(ToolSchema);

export const WorkflowVersionSummarySchema = z.object({
  version: z.number(),
  status: z.string(),
  published_at: z.string().nullable(),
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  versions: z.array(WorkflowVersionSummarySchema),
});
export const WorkflowListSchema = z.array(WorkflowSchema);

export const StepSchema = z.object({
  step_id: z.string(),
  name: z.string(),
  tool_id: z.string(),
  depends_on: z.array(z.string()),
});

export const WorkflowVersionSchema = z.object({
  id: z.string(),
  workflow_id: z.string(),
  version: z.number(),
  status: z.string(),
  definition: z.object({ steps: z.array(StepSchema).default([]) }).passthrough(),
  created_at: z.string(),
  published_at: z.string().nullable(),
});

export const ApprovalSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  reason: z.string(),
  status: z.string(),
  requested_at: z.string(),
  decided_at: z.string().nullable(),
  decided_by: z.string().nullable(),
  decision_note: z.string().nullable(),
});
export const ApprovalListSchema = z.array(ApprovalSchema);

export const RunStatsSchema = z.object({
  total: z.number(),
  active: z.number(),
  by_status: z.record(z.number()),
  // Defaulted so a backend without the cost rollup still parses.
  total_cost_usd: z.number().default(0),
});

export const RunViewSchema = z.object({
  run_id: z.string(),
  tenant_id: z.string(),
  status: z.string(),
  goal: z.string(),
  priority: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  event_count: z.number(),
});
export const RunViewListSchema = z.array(RunViewSchema);

export const MemberSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
});
export const MemberListSchema = z.array(MemberSchema);
