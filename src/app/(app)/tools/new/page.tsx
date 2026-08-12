"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterTool } from "@/hooks/use-tools";
import { ApiError } from "@/lib/api/problem";

type Kind = "builtin" | "http" | "mcp";

function parseJsonObject(label: string, value: string): Record<string, unknown> {
  if (!value.trim()) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

export default function NewToolPage() {
  const router = useRouter();
  const registerTool = useRegisterTool();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("builtin");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const configObj = parseJsonObject("Config", config);
      await registerTool.mutateAsync({ name, kind, description, config: configObj });
      router.push("/tools");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError("Could not register the tool.");
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/tools"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tools
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Register tool</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field label="Name" hint="Builtin tools must be named exactly: llm, echo, or uppercase.">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="llm" required />
            </Field>
            <Field label="Kind">
              <Select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
                <option value="builtin">Builtin</option>
                <option value="http">HTTP</option>
                <option value="mcp">MCP</option>
              </Select>
            </Field>
            <Field label="Description (optional)">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarizes text via the LLM gateway"
              />
            </Field>
            {kind !== "builtin" && (
              <Field
                label="Config (JSON)"
                hint={kind === "http" ? "e.g. { \"url\": \"https://...\", \"method\": \"POST\" }" : "MCP server config"}
              >
                <Textarea value={config} onChange={(e) => setConfig(e.target.value)} placeholder="{}" />
              </Field>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={registerTool.isPending} className="mt-1 self-start">
              {registerTool.isPending ? "Registering…" : "Register tool"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
