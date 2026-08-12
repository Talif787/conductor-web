"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateRun } from "@/hooks/use-runs";
import { ApiError } from "@/lib/api/problem";
import { useState } from "react";

const schema = z.object({
  goal: z.string().min(1, "Describe what this run should accomplish."),
  priority: z.enum(["low", "normal", "high"]),
  prompt: z.string().optional(),
  workflowId: z.string().optional(),
  workflowVersion: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewRunPage() {
  const router = useRouter();
  const createRun = useCreateRun();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { priority: "normal" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const run = await createRun.mutateAsync({
        goal: values.goal,
        priority: values.priority,
        parameters: values.prompt ? { prompt: values.prompt } : {},
        workflow_id: values.workflowId || null,
        workflow_version: values.workflowId ? values.workflowVersion || "1" : null,
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
              <select
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("priority")}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Prompt (optional)" hint="Passed to the run as parameters.prompt" error={errors.prompt?.message}>
              <Input placeholder="summarize the quarterly report" {...register("prompt")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Workflow ID (optional)" error={errors.workflowId?.message}>
                <Input placeholder="uuid" className="font-mono" {...register("workflowId")} />
              </Field>
              <Field label="Version" error={errors.workflowVersion?.message}>
                <Input placeholder="1" {...register("workflowVersion")} />
              </Field>
            </div>
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

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
