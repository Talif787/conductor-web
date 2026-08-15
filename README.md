# Conductor Web

The web control plane for **Conductor**, an agentic AI workflow automation platform. This is the Next.js frontend; it talks to the Conductor control-api (a separate Python/FastAPI service) for all data.

Runs, workflows, tools, approvals, and observability, in a dark-first, keyboard-friendly interface.

## Architecture

Conductor is two independently deployed repositories:

- **conductor-web** (this repo): Next.js 15 App Router frontend.
- **conductor** (control-api): Python/FastAPI backend with a domain-driven, CQRS-influenced design, PostgreSQL persistence, JWT/RBAC auth, an outbox-relay read model, and a workflow execution engine.

The frontend never calls the backend cross-origin in development. A Next.js rewrite proxies `/api/v1/*` to the control-api server-side, so the browser stays same-origin (no CORS, no cross-origin token handling). The proxy target is set with `CONDUCTOR_API_ORIGIN`.

## Tech stack

- Next.js 15 (App Router) and React 19
- TypeScript
- Tailwind CSS v3 with CSS-variable design tokens
- TanStack Query v5 for server state
- React Hook Form and Zod for forms and validation
- A Zod response layer that validates every API payload at the boundary
- next-themes (dark/light/system), lucide-react, class-variance-authority
- next-intl for internationalization
- Vitest, React Testing Library, and Playwright for tests
- Storybook for component development

## Features

- **Runs**: list, detail with an execution timeline and per-step cost, and a new-run form that selects a published workflow version from a dropdown.
- **Workflows**: authoring with a step editor and a hand-rolled, cycle-guarded DAG visualization; draft save, publish, and a round-trip that repopulates the editor from a saved version; a read-only graph for published versions.
- **Tools**: a registry with listing and registration.
- **Approvals**: a governance inbox (pending/approved/rejected) with approve and reject, gated on the `runs:approve` permission.
- **Insights**: a dashboard over the stats read model (total/active/completed/failed, a status-breakdown bar, recent activity) plus a tenant cost rollup.
- **Settings**: account identity, a grouped view of the current role's RBAC permissions, appearance (theme), and member management (add a member with an admin-set temporary password, change a member's role), gated on `members:read` / `members:write`.
- **Command palette**: `Cmd`/`Ctrl+K` for navigation, creation, and theme toggling.
- **Accessibility**: visible keyboard focus, labeled navigation with `aria-current`, a skip-to-content link, and named DAG graphics.
- **Internationalization**: next-intl wired with English and Spanish, with the login screen fully translated and an EN/ES switch (see Scope below).
- **Installable PWA**: web app manifest, maskable icons, and a conservative service worker with an offline fallback.

Authentication uses JWT access and refresh tokens with refresh-on-401. Tokens are held in memory and mirrored to `localStorage` for dev convenience; this tradeoff is documented in the auth provider.

## Getting started

Requirements: Node.js 20 or newer, and a running control-api (see the `conductor` repo) reachable at `http://localhost:8000`.

```bash
npm install
cp .env.local.example .env.local   # sets CONDUCTOR_API_ORIGIN=http://localhost:8000
npm run dev                         # development server on :3000
```

For a production-like run (required to exercise the service worker):

```bash
npm run build
npm run start
```

### Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `CONDUCTOR_API_ORIGIN` | Origin the `/api/v1/*` proxy forwards to | `http://localhost:8000` |

## Testing

The project has three test layers plus a component workshop.

### Unit and component tests (Vitest)

```bash
npm run test
```

Runs pure-logic unit tests (formatting helpers and the Zod API schemas, including a regression guard that the paged-runs schema requires `items`) and component tests (React Testing Library, in jsdom) for the presentational components.

### End-to-end tests (Playwright)

E2E drives the real app against a running backend. It is a local gate (not part of CI).

```bash
npm install -D @playwright/test
npx playwright install chromium
npm run e2e                         # headless; requires the backend on :8000
```

A global setup seeds a dedicated E2E account via the backend, then the auth-flow specs verify the login guard, a successful sign-in, and rejection of bad credentials.

### Storybook

```bash
npm run storybook                   # component workshop on :6006
npm run build-storybook             # static build
```

## Continuous integration

GitHub Actions runs the unit gate on every push and pull request: `typecheck`, `lint`, `build`, and `test` (Vitest). Playwright and Storybook are local gates and are not run in CI, so a green CI reflects the unit, component, type, and build checks.

## Internationalization

Locale is selected without URL routing: the active language comes from a `NEXT_LOCALE` cookie (default English), read server-side. Messages live in `messages/<locale>.json`. To translate another surface, add keys to the catalogs and replace that component's strings with `useTranslations` calls under a new namespace.

## Progressive web app

`app/manifest.ts` generates the web app manifest, `public/icons` holds the maskable icon set, and `public/sw.js` is a deliberately conservative service worker: network-first for navigations with an offline fallback, cache-first only for static build assets, and it never intercepts `/api/` traffic (so live data stays fresh and the service worker cannot serve a stale app). Registration happens only in production builds.

## Conventions

- The app was built in vertical slices, each a small, reviewable pull request with its own tag.
- Conventional Commits, squash-merge, CI green before merge.
- No em dashes anywhere in the codebase or docs (a project style rule).

## Scope and intentional limitations

This section documents what is deliberately out of scope, so the boundaries are explicit rather than implied.

- **Internationalization** covers the login screen. The rest of the UI and the Zod inline validation messages remain English; the machinery is in place to extend namespace by namespace.
- **Playwright and Storybook are not wired into CI.** They are local gates. A CI job that stands up the full stack for E2E is possible but was left as future work.
- **Offline support is a fallback page**, not a fully offline-capable app. Conductor is a live control plane whose data requires the backend, so offline shows the fallback rather than cached application screens.
- **Component test coverage** targets provider-free presentational components. Provider-heavy pieces (the command palette, member-management forms) would need mock-provider decorators and are not covered.
- **Deferred product features** (not built): tenant ownership transfer and multiple owners, forced password rotation and a change-password flow, and time-series or per-workflow cost analytics. Per-run cost is shown on the run detail; the Insights cost figure is an all-time tenant rollup.

## License

Private portfolio project.
