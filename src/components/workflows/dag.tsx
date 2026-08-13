"use client";

import { useMemo } from "react";
import type { WorkflowStep } from "@/lib/api/types";

const COL_W = 210;
const ROW_H = 76;
const NODE_W = 168;
const NODE_H = 48;
const PAD = 16;

interface Placed {
  step: WorkflowStep;
  x: number;
  y: number;
}

// Longest-path layering with a cycle guard, so a malformed graph still renders.
function layout(steps: WorkflowStep[]): { placed: Placed[]; width: number; height: number } {
  const byId = new Map(steps.map((s) => [s.step_id, s]));
  const layerCache = new Map<string, number>();
  const visiting = new Set<string>();

  const layerOf = (id: string): number => {
    if (layerCache.has(id)) return layerCache.get(id)!;
    if (visiting.has(id)) return 0; // cycle: break it
    visiting.add(id);
    const step = byId.get(id);
    const deps = (step?.depends_on ?? []).filter((d) => byId.has(d) && d !== id);
    const layer = deps.length === 0 ? 0 : 1 + Math.max(...deps.map(layerOf));
    visiting.delete(id);
    layerCache.set(id, layer);
    return layer;
  };

  const columns = new Map<number, WorkflowStep[]>();
  for (const step of steps) {
    const l = layerOf(step.step_id);
    if (!columns.has(l)) columns.set(l, []);
    columns.get(l)!.push(step);
  }

  const placed: Placed[] = [];
  let maxRows = 0;
  for (const [layer, colSteps] of columns) {
    maxRows = Math.max(maxRows, colSteps.length);
    colSteps.forEach((step, i) => {
      placed.push({ step, x: PAD + layer * COL_W, y: PAD + i * ROW_H });
    });
  }
  const maxLayer = Math.max(0, ...[...columns.keys()]);
  return {
    placed,
    width: PAD * 2 + maxLayer * COL_W + NODE_W,
    height: PAD * 2 + Math.max(0, maxRows - 1) * ROW_H + NODE_H,
  };
}

export function WorkflowDag({
  steps,
  toolName,
}: {
  steps: WorkflowStep[];
  toolName?: (id: string) => string;
}) {
  const { placed, width, height } = useMemo(() => layout(steps), [steps]);
  const pos = useMemo(() => new Map(placed.map((p) => [p.step.step_id, p])), [placed]);

  if (steps.length === 0) {
    return (
      <div
        role="status"
        className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground"
      >
        Add steps to see the graph.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Workflow graph with ${steps.length} step${steps.length === 1 ? "" : "s"}`}
      className="overflow-auto rounded-lg border border-border bg-muted/20 p-2"
    >
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="absolute inset-0" aria-hidden>
          {placed.flatMap(({ step }) =>
            (step.depends_on ?? [])
              .filter((d) => pos.has(d) && d !== step.step_id)
              .map((dep) => {
                const from = pos.get(dep)!;
                const to = pos.get(step.step_id)!;
                const x1 = from.x + NODE_W;
                const y1 = from.y + NODE_H / 2;
                const x2 = to.x;
                const y2 = to.y + NODE_H / 2;
                const mx = (x1 + x2) / 2;
                return (
                  <path
                    key={`${dep}->${step.step_id}`}
                    d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth={1.5}
                  />
                );
              }),
          )}
        </svg>
        {placed.map(({ step, x, y }) => (
          <div
            key={step.step_id}
            className="absolute flex flex-col justify-center rounded-md border border-border bg-card px-3 shadow-sm"
            style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
          >
            <span className="truncate font-mono text-xs font-medium">{step.step_id}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {toolName ? toolName(step.tool_id) : step.tool_id.slice(0, 8)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
