import { describe, expect, it } from "vitest";
import {
  ApprovalSchema,
  PagedRunsSchema,
  RunSchema,
  RunStatsSchema,
  ToolListSchema,
  WorkflowSchema,
} from "@/lib/api/schemas";

describe("PagedRunsSchema", () => {
  it("parses the real API shape (items + next_cursor)", () => {
    const parsed = PagedRunsSchema.parse({ items: [], next_cursor: null });
    expect(parsed.items).toEqual([]);
    expect(parsed.next_cursor).toBeNull();
  });

  // Regression guard for the shipped bug where the client read `runs`
  // instead of `items`. A wrong-shaped payload must fail at the boundary.
  it("rejects a payload keyed on runs instead of items", () => {
    expect(() => PagedRunsSchema.parse({ runs: [], next_cursor: null })).toThrow();
  });
});

describe("RunSchema", () => {
  it("accepts a run without the optional error and workflow fields", () => {
    const run = RunSchema.parse({
      id: "r1",
      status: "queued",
      goal: "g",
      priority: "normal",
      created_at: "2026-08-13T00:00:00Z",
      updated_at: "2026-08-13T00:00:00Z",
    });
    expect(run.workflow_id).toBeUndefined();
  });
});

describe("bare-array schemas", () => {
  it("ToolListSchema parses an array and rejects a non-array", () => {
    expect(ToolListSchema.parse([])).toEqual([]);
    expect(() => ToolListSchema.parse({})).toThrow();
  });
});

describe("ApprovalSchema", () => {
  it("parses a pending approval", () => {
    const a = ApprovalSchema.parse({
      id: "a1",
      run_id: "r1",
      reason: "high priority runs require approval",
      status: "pending",
      requested_at: "2026-08-13T00:00:00Z",
      decided_at: null,
      decided_by: null,
      decision_note: null,
    });
    expect(a.status).toBe("pending");
  });
});

describe("RunStatsSchema", () => {
  it("parses the stats read-model shape", () => {
    const s = RunStatsSchema.parse({ total: 3, active: 1, by_status: { completed: 2, failed: 1 } });
    expect(s.total).toBe(3);
    expect(s.by_status.completed).toBe(2);
  });
});

describe("WorkflowSchema", () => {
  it("parses a workflow with version summaries", () => {
    const wf = WorkflowSchema.parse({
      id: "w1",
      name: "demo",
      description: "",
      status: "draft",
      created_at: "2026-08-13T00:00:00Z",
      updated_at: "2026-08-13T00:00:00Z",
      versions: [{ version: 1, status: "draft", published_at: null }],
    });
    expect(wf.versions[0].version).toBe(1);
  });
});
