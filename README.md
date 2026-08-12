# Conductor Web

Frontend for the Conductor control plane. Slice 9a: foundation, auth, and the runs
vertical (list, detail with the live execution timeline and cost, create).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v3 · TanStack Query ·
React Hook Form + Zod · next-themes · lucide-react. Server state lives in TanStack
Query; client state is limited to an auth context and the theme.

## Run it

The control-api must be running on :8000 (see services/control-api). The Next
config proxies `/api/v1/*` to it, so the browser stays same-origin (no CORS).

```bash
cd web
cp .env.local.example .env.local     # adjust CONDUCTOR_API_ORIGIN if needed
npm install
npm run dev                          # http://localhost:3000
```

Open http://localhost:3000, register a workspace (or sign in), then create and
execute a run. If you have run the backend cost demo, the run detail shows the
execution timeline with per-step and total cost.

## Checks

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run build        # production build
```

## Layout

- `src/app`: routes: `(auth)/login`, `(app)/runs` (list, `[id]`, `new`).
- `src/lib/api`: typed client (`client.ts`), DTO types, RFC7807 problem parsing.
- `src/lib/auth`: token store and the auth context/provider.
- `src/lib/query`: TanStack Query provider.
- `src/hooks`: per-resource query hooks.
- `src/components/ui`: primitives (Button, Input, Card).
- `src/components/runs`: feature components (StatusBadge).

## Auth and security

Tokens are held in memory and mirrored to `localStorage` so a reload keeps the
session; the client refreshes once on a 401 against `/auth/refresh`, then clears
the session on a second failure. Storing the refresh token in `localStorage` is a
development tradeoff; a hardened build hands tokens to an httpOnly cookie via a
server route. That, plus CSP and the Lighthouse pass, is slated for slice 9e.

## Not yet built (later slices)

Workflows and tools authoring (9b), approvals inbox (9c), the stats/insights
dashboard and cost rollups (9d), command palette, Storybook, and tests (9e). The
nav shows these as "soon".
