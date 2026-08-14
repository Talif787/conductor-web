"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-provider";
import { useAddMember, useChangeMemberRole, useMembers } from "@/hooks/use-members";
import { ApiError } from "@/lib/api/problem";
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

      {hasPermission("members:read") && (
        <MembersCard canWrite={hasPermission("members:write")} />
      )}

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

function MembersCard({ canWrite }: { canWrite: boolean }) {
  const { data, isLoading, isError } = useMembers();
  const members = data ?? [];
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading members…</p>}
        {isError && <p className="text-sm text-destructive">Could not load members.</p>}
        {!isLoading && !isError && members.length === 0 && (
          <p className="text-sm text-muted-foreground">No members found.</p>
        )}
        {members.length > 0 && (
          <div className="divide-y divide-border">
            {members.map((m) => (
              <MemberRow key={m.user_id} member={m} canWrite={canWrite} />
            ))}
          </div>
        )}
        {canWrite && <AddMemberForm />}
      </CardContent>
    </Card>
  );
}

function MemberRow({
  member,
  canWrite,
}: {
  member: { user_id: string; email: string; roles: string[] };
  canWrite: boolean;
}) {
  const changeRole = useChangeMemberRole();
  const isOwner = member.roles.includes("owner");
  const primaryRole = member.roles[0] ?? "viewer";
  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="min-w-0 flex-1 truncate text-sm">{member.email}</span>
      {canWrite && !isOwner ? (
        <Select
          aria-label={`Role for ${member.email}`}
          value={primaryRole}
          disabled={changeRole.isPending}
          onChange={(e) => changeRole.mutate({ userId: member.user_id, role: e.target.value })}
          className="w-36"
        >
                  <option value="admin">Admin</option>
                  <option value="author">Author</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
        </Select>
      ) : (
        <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium capitalize">
          {primaryRole}
        </span>
      )}
      <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
        {member.user_id.slice(0, 8)}
      </span>
      {changeRole.isError && (
        <span className="w-full text-xs text-destructive">
          {changeRole.error instanceof ApiError ? changeRole.error.message : "Could not change role."}
        </span>
      )}
    </div>
  );
}

function AddMemberForm() {
  const addMember = useAddMember();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await addMember.mutateAsync({ email, password, role });
      setEmail("");
      setPassword("");
      setRole("viewer");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add member.");
    }
  };

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Add member
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="email@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="New member email"
        />
        <Input
          type="password"
          placeholder="temp password (8+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Temporary password"
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label="New member role"
          className="sm:w-36"
        >
                  <option value="admin">Admin</option>
                  <option value="author">Author</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
        </Select>
        <Button
          onClick={submit}
          disabled={addMember.isPending || !email || password.length < 8}
        >
          {addMember.isPending ? "Adding…" : "Add"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        The member signs in with this temporary password.
      </p>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
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
