"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateWorkflow } from "@/hooks/use-workflows";
import { ApiError } from "@/lib/api/problem";

export default function NewWorkflowPage() {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const wf = await createWorkflow.mutateAsync({ name, description });
      router.push(`/workflows/${wf.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the workflow.");
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/workflows"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Workflows
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Report summarizer" required />
            </Field>
            <Field label="Description (optional)">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarizes quarterly reports"
              />
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={createWorkflow.isPending} className="mt-1 self-start">
              {createWorkflow.isPending ? "Creating…" : "Create workflow"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Creating a workflow seeds an empty draft version 1, which you then author and publish.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
