// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkflowDag } from "@/components/workflows/dag";

const steps = [
  { step_id: "retrieve", name: "Retrieve", tool_id: "tool-1", depends_on: [] },
  { step_id: "summarize", name: "Summarize", tool_id: "tool-2", depends_on: ["retrieve"] },
];

describe("WorkflowDag", () => {
  it("shows the empty state with no steps", () => {
    render(<WorkflowDag steps={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Add steps to see the graph.");
  });

  it("renders a node per step and resolves tool names", () => {
    render(<WorkflowDag steps={steps} toolName={(id) => id.toUpperCase()} />);
    expect(screen.getByText("retrieve")).toBeInTheDocument();
    expect(screen.getByText("summarize")).toBeInTheDocument();
    expect(screen.getByText("TOOL-1")).toBeInTheDocument();
    expect(screen.getByText("TOOL-2")).toBeInTheDocument();
  });

  it("names the graph for screen readers with a step count", () => {
    render(<WorkflowDag steps={steps} />);
    expect(screen.getByRole("img", { name: "Workflow graph with 2 steps" })).toBeInTheDocument();
  });

  it("uses the singular for a single step", () => {
    render(<WorkflowDag steps={steps.slice(0, 1)} />);
    expect(screen.getByRole("img", { name: "Workflow graph with 1 step" })).toBeInTheDocument();
  });
});
