// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/runs/status-badge";

describe("StatusBadge", () => {
  it("humanizes a known status", () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("humanizes a multi-word status", () => {
    render(<StatusBadge status="awaiting_approval" />);
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
  });

  it("falls back to the raw value for an unknown status", () => {
    render(<StatusBadge status="mystery" />);
    expect(screen.getByText("mystery")).toBeInTheDocument();
  });
});
