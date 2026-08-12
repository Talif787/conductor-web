"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/problem";
import { useAuth } from "@/lib/auth/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "At least 8 characters."),
});
const registerSchema = loginSchema.extend({
  tenantName: z.string().min(1, "Name your workspace."),
});
type FormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, register: registerTenant } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = mode === "login" ? loginSchema : registerSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!loading && user) router.replace("/runs");
  }, [loading, user, router]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (mode === "login") await login(values.email, values.password);
      else await registerTenant(values.tenantName, values.email, values.password);
      router.replace("/runs");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Conductor
          </div>
          <CardTitle>{mode === "login" ? "Sign in" : "Create your workspace"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
            {mode === "register" && (
              <Field label="Workspace name" error={errors.tenantName?.message}>
                <Input placeholder="Acme" {...register("tenantName")} />
              </Field>
            )}
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <Input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                {...register("password")}
              />
            </Field>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" disabled={isSubmitting} className="mt-1">
              {mode === "login" ? "Sign in" : "Create workspace"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => {
              setServerError(null);
              setMode(mode === "login" ? "register" : "login");
            }}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "login" ? "New here? Create a workspace" : "Have an account? Sign in"}
          </button>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
