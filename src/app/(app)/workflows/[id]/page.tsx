"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/runs/status-badge";
import { WorkflowDag } from "@/components/workflows/dag";
import { useTools } from "@/hooks/use-tools";
import {
  usePublishVersion,
  useSaveDraft,
  useWorkflow,
  useWorkflowVersion,
} from "@/hooks/use-workflows";
import { ApiError } from "@/lib/api/problem";
import type { WorkflowStep } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils";

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: workflow, isLoading, isError, error } = useWorkflow(id);
  const { data: toolsData } = useTools();
  const tools = toolsData ?? [];

  const draft = useMemo(
    () =>
      workflow?.versions
        .filter((v) => v.status === "draft")
        .sort((a, b) => b.version - a.version)[0],
    [workflow],
  );

  const latestPublished = useMemo(
    () =>
      workflow?.versions
        .filter((v) => v.status === "published")
        .sort((a, b) => b.version - a.version)[0],
    [workflow],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading workflow…</p>;
  if (isError || !workflow) {
    return (
      <Card className="p-6 text-sm text-destructive">
        {error instanceof ApiError ? error.message : "Workflow not found."}
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/workflows"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Workflows
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <StatusBadge status={workflow.status} />
        <h1 className="text-xl font-semibold tracking-tight">{workflow.name}</h1>
        <span className="font-mono text-xs text-muted-foreground">{workflow.id.slice(0, 8)}</span>
      </div>
      {workflow.description && (
        <p className="-mt-4 mb-6 text-sm text-muted-foreground">{workflow.description}</p>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {workflow.versions
            .slice()
            .sort((a, b) => a.version - b.version)
            .map((v) => (
              <div key={v.version} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <span className="font-mono text-sm">v{v.version}</span>
                <StatusBadge status={v.status} />
                <span className="ml-auto text-xs text-muted-foreground">
                  {v.published_at ? `published ${formatDateTime(v.published_at)}` : "unpublished"}
                </span>
              </div>
            ))}
        </CardContent>
      </Card>

      {latestPublished && (
        <PublishedGraph workflowId={workflow.id} version={latestPublished.version} tools={tools} />
      )}

      {draft ? (
        <DraftEditor
          workflowId={workflow.id}
          version={draft.version}
          tools={tools}
        />
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          No draft version to edit. All versions are published; the published graph is shown above.
        </Card>
      )}
    </div>
  );
}

function PublishedGraph({
  workflowId,
  version,
  tools,
}: {
  workflowId: string;
  version: number;
  tools: { id: string; name: string }[];
}) {
  const { data, isLoading, isError } = useWorkflowVersion(workflowId, version);
  const toolName = (tid: string) => tools.find((t) => t.id === tid)?.name ?? tid.slice(0, 8);
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Published graph (v{version})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading graph…</p>}
        {isError && <p className="text-sm text-destructive">Could not load the published graph.</p>}
        {data && <WorkflowDag steps={data.definition.steps} toolName={toolName} />}
      </CardContent>
    </Card>
  );
}

function DraftEditor({
  workflowId,
  version,
  tools,
}: {
  workflowId: string;
  version: number;
  tools: { id: string; name: string }[];
}) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const versionQuery = useWorkflowVersion(workflowId, version);
  const saveDraft = useSaveDraft(workflowId, version);
  const publish = usePublishVersion(workflowId, version);

  // Load the saved draft definition once, so a reload repopulates the editor
  // instead of starting empty. User edits after seeding are not clobbered.
  useEffect(() => {
    if (!seeded && versionQuery.data) {
      setSteps(versionQuery.data.definition.steps ?? []);
      setSeeded(true);
    }
  }, [seeded, versionQuery.data]);

  const toolName = (tid: string) => tools.find((t) => t.id === tid)?.name ?? tid.slice(0, 8);

  const addStep = () => {
    const n = steps.length + 1;
    setSteps([
      ...steps,
      { step_id: `step_${n}`, name: "", tool_id: tools[0]?.id ?? "", depends_on: [] },
    ]);
    setSaved(false);
  };

  const patchStep = (i: number, patch: Partial<WorkflowStep>) => {
    setSteps(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    setSaved(false);
  };

  const removeStep = (i: number) => {
    const removedId = steps[i].step_id;
    setSteps(
      steps
        .filter((_, idx) => idx !== i)
        .map((s) => ({ ...s, depends_on: s.depends_on.filter((d) => d !== removedId) })),
    );
    setSaved(false);
  };

  const toggleDep = (i: number, depId: string) => {
    const s = steps[i];
    const has = s.depends_on.includes(depId);
    patchStep(i, {
      depends_on: has ? s.depends_on.filter((d) => d !== depId) : [...s.depends_on, depId],
    });
  };

  const validate = (): string | null => {
    if (steps.length === 0) return "Add at least one step.";
    const ids = new Set<string>();
    for (const s of steps) {
      if (!s.step_id.trim()) return "Every step needs a step id.";
      if (ids.has(s.step_id)) return `Duplicate step id: ${s.step_id}`;
      ids.add(s.step_id);
      if (!s.tool_id) return `Step ${s.step_id} needs a tool.`;
    }
    return null;
  };

  const onSave = async () => {
    setError(null);
    setSaved(false);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      await saveDraft.mutateAsync(steps);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the draft.");
    }
  };

  const onPublish = async () => {
    setError(null);
    try {
      await publish.mutateAsync();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not publish the version.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Draft v{version}</CardTitle>
          <Button variant="outline" size="sm" onClick={addStep} disabled={tools.length === 0}>
            <Plus className="h-4 w-4" /> Add step
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {tools.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Register a tool first on the{" "}
              <Link href="/tools/new" className="underline">
                Tools
              </Link>{" "}
              page, then add steps here.
            </p>
          )}
          {steps.map((step, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Step id">
                  <Input
                    value={step.step_id}
                    onChange={(e) => patchStep(i, { step_id: e.target.value })}
                    className="font-mono"
                  />
                </Field>
                <Field label="Name">
                  <Input value={step.name} onChange={(e) => patchStep(i, { name: e.target.value })} />
                </Field>
                <Field label="Tool">
                  <Select value={step.tool_id} onChange={(e) => patchStep(i, { tool_id: e.target.value })}>
                    {tools.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              {steps.length > 1 && (
                <div className="mt-3">
                  <span className="text-xs font-medium text-muted-foreground">Depends on</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {steps
                      .filter((_, idx) => idx !== i)
                      .map((other) => (
                        <label
                          key={other.step_id}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={step.depends_on.includes(other.step_id)}
                            onChange={() => toggleDep(i, other.step_id)}
                          />
                          <span className="font-mono">{other.step_id}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove step
              </button>
            </div>
          ))}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && !error && <p className="text-sm text-status-completed">Draft saved.</p>}

          <div className="flex gap-2">
            <Button onClick={onSave} disabled={saveDraft.isPending || steps.length === 0}>
              {saveDraft.isPending ? "Saving…" : "Save draft"}
            </Button>
            <Button variant="secondary" onClick={onPublish} disabled={publish.isPending}>
              {publish.isPending ? "Publishing…" : "Publish v" + version}
            </Button>
          </div>
          {versionQuery.isLoading && !seeded && (
            <p className="text-sm text-muted-foreground">Loading saved steps…</p>
          )}
          <p className="text-xs text-muted-foreground">
            Steps load from the saved draft. Save writes the full definition; publish freezes it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowDag steps={steps} toolName={toolName} />
        </CardContent>
      </Card>
    </div>
  );
}
