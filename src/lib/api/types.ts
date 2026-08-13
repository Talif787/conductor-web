import type { z } from "zod";
import type {
  AuthTokensSchema,
  MeSchema,
  PagedRunsSchema,
  RunExecutionSchema,
  RunSchema,
  StepExecutionSchema,
  StepSchema,
  ToolSchema,
  WorkflowSchema,
  WorkflowVersionSchema,
  WorkflowVersionSummarySchema,
  ApprovalSchema,
  RunStatsSchema,
  RunViewSchema,
  MemberSchema,
} from "@/lib/api/schemas";

export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type Me = z.infer<typeof MeSchema>;
export type Run = z.infer<typeof RunSchema>;
export type RunStatus = string;
export type PagedRuns = z.infer<typeof PagedRunsSchema>;
export type StepExecution = z.infer<typeof StepExecutionSchema>;
export type RunExecution = z.infer<typeof RunExecutionSchema>;
export type Tool = z.infer<typeof ToolSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowVersionSummary = z.infer<typeof WorkflowVersionSummarySchema>;
export type WorkflowVersion = z.infer<typeof WorkflowVersionSchema>;
export type WorkflowStep = z.infer<typeof StepSchema>;
export type Approval = z.infer<typeof ApprovalSchema>;
export type RunStats = z.infer<typeof RunStatsSchema>;
export type RunView = z.infer<typeof RunViewSchema>;
export type Member = z.infer<typeof MemberSchema>;

export type ExecuteResult =
  | { kind: "executed"; execution: RunExecution }
  | { kind: "pending"; approval: Approval };

export interface CreateRunInput {
  goal: string;
  priority?: "low" | "normal" | "high";
  parameters?: Record<string, unknown>;
  workflow_id?: string | null;
  workflow_version?: string | null;
}

export interface RegisterToolInput {
  name: string;
  kind: "builtin" | "http" | "mcp";
  description?: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  config?: Record<string, unknown>;
}
