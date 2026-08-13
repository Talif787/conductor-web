"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-provider";
import { useMembers } from "@/hooks/use-members";
import { cn } from "@/lib/utils";

// Friendly labels for the RBAC permission strings the token carries.
const PERMISSION_LABEL: Record<string, string> = {
  "runs:read": "View runs",
  "runs:create": "Create runs",
  "runs:cancel": "Cancel runs",
  "runs:execute": "Execute runs",
  "runs:approve": "Approve runs",
  "tools:read": "View tools",
  "tools:write": "Manage tools",
  "workflows:read": "View workflows",
  "workflows:write": "Edit workflows",
  "workflows:publish": "Publish workflows",
  "members:read": "View members",
  "members:write": "Manage members",
};

const RESOURCE_LABEL: Record<string, string> = {
  runs: "Runs",
  tools: "Tools",
  workflows: "Workflows",
  members: "Members",
};

export default function SettingsPage() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  // Group permissions by resource (the part before the colon).
  const groups = new Map<string, string[]>();
  for (const perm of [...user.permissions].sort()) {
    const [resource] = perm.split(":");
    if (!groups.has(resource)) groups.set(resource, []);
    groups.get(resource)!.push(perm);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account, role, and preferences.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <Row label="Workspace">
            <span className="font-mono text-xs">{user.tenant_id}</span>
          </Row>
          <Row label="User ID">
            <span className="font-mono text-xs">{user.user_id}</span>
          </Row>
          <Row label="Roles">
            <div className="flex flex-wrap gap-1.5">
              {user.roles.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium capitalize"
                >
                  {r}
                </span>
              ))}
            </div>
          </Row>
        </CardContent>
      </Card>

      {hasPermission("members:read") && <MembersCard />}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            What your role can do in this workspace ({user.permissions.length} permissions).
          </p>
          {[...groups.entries()].map(([resource, perms]) => (
            <div key={resource}>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {RESOURCE_LABEL[resource] ?? resource}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {perms.map((perm) => (
                  <span
                    key={perm}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs"
                    title={perm}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-status-completed" aria-hidden />
                    {PERMISSION_LABEL[perm] ?? perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemePicker />
        </CardContent>
      </Card>
    </div>
  );
}

function MembersCard() {
  const { data, isLoading, isError } = useMembers();
  const members = data ?? [];
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading members…</p>}
        {isError && <p className="text-sm text-destructive">Could not load members.</p>}
        {!isLoading && !isError && members.length === 0 && (
          <p className="text-sm text-muted-foreground">No members found.</p>
        )}
        {members.length > 0 && (
          <div className="divide-y divide-border">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{m.email}</span>
                <div className="flex flex-wrap gap-1.5">
                  {m.roles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium capitalize"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                  {m.user_id.slice(0, 8)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = ["system", "light", "dark"] as const;
  const current = mounted ? (theme ?? "system") : "system";

  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setTheme(opt)}
          className={cn(
            "rounded px-3 py-1 text-sm capitalize",
            current === opt ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
          )}
          aria-pressed={current === opt}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
