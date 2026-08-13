"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateRun } from "@/hooks/use-runs";
import { useWorkflows } from "@/hooks/use-workflows";
import { ApiError } from "@/lib/api/problem";

const schema = z.object({
  goal: z.string().min(1, "Describe what this run should accomplish."),
  priority: z.enum(["low", "normal", "high"]),
  prompt: z.string().optional(),
  // Encodes "workflowId:version" for a published version, or "" for none.
  workflow: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewRunPage() {
  const router = useRouter();
  const createRun = useCreateRun();
  const { data: workflows } = useWorkflows();
  const [serverError, setServerError] = useState<string | null>(null);

  // Only published versions are executable, so those are the only valid targets.
  const publishedOptions = (workflows ?? []).flatMap((wf) =>
    wf.versions
      .filter((v) => v.status === "published")
      .map((v) => ({ value: `${wf.id}:${v.version}`, label: `${wf.name} (v${v.version})` })),
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { priority: "normal" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    let workflowId: string | null = null;
    let workflowVersion: string | null = null;
    if (values.workflow) {
      const [id, version] = values.workflow.split(":");
      workflowId = id;
      workflowVersion = version;
    }
    try {
      const run = await createRun.mutateAsync({
        goal: values.goal,
        priority: values.priority,
        parameters: values.prompt ? { prompt: values.prompt } : {},
        workflow_id: workflowId,
        workflow_version: workflowVersion,
      });
      router.push(`/runs/${run.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Could not create the run.");
    }
  });

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/runs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Runs
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New run</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Field label="Goal" error={errors.goal?.message}>
              <Input placeholder="Summarize the quarterly report" {...register("goal")} />
            </Field>
            <Field label="Priority" error={errors.priority?.message}>
              <Select {...register("priority")}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Prompt (optional)" hint="Passed to the run as parameters.prompt">
              <Input placeholder="summarize the quarterly report" {...register("prompt")} />
            </Field>
            <Field
              label="Workflow"
              hint="Only published workflows can be executed. A run without one is created but cannot execute."
            >
              <Select {...register("workflow")}>
                <option value="">None (run will not be executable)</option>
                {publishedOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            {publishedOptions.length === 0 && (
              <p className="-mt-2 text-xs text-muted-foreground">
                No published workflows yet. Publish one on the{" "}
                <Link href="/workflows" className="underline">
                  Workflows
                </Link>{" "}
                page to make executable runs.
              </p>
            )}
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" disabled={isSubmitting} className="mt-1 self-start">
              {isSubmitting ? "Creating…" : "Create run"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
