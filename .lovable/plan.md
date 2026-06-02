
# Trademark Management System — Build Plan

A full internal admin tool for an IP firm to manage Trademark, NTN, Copyright, and Company cases — with phase tracking, payments, agent assignments, search, and Google Drive folder automation.

## 1. Stack & infrastructure

- **Frontend:** TanStack Start (existing template), Tailwind, shadcn/ui, dashboard layout with collapsible sidebar.
- **Backend:** Lovable Cloud (Supabase) — Postgres + Auth + RLS. All reads/writes via `createServerFn` with `requireSupabaseAuth`.
- **Auth:** Email/password (Lovable Cloud). Single internal team — any signed-in user has full access. `/login`, `/signup`, `/_authenticated` layout guard.
- **Google Drive:** App-user OAuth connector (per-user). User connects their Drive once from Settings; the app auto-creates client + case folders and stores `folder_id` + link on the case.
- **Theme:** Emerald Prestige palette (#064e3b, #0d7a5f, #c9a84c, #f5f0e0) + Outfit (headings) / Figtree (body) — wired into `src/styles.css` as oklch tokens.

## 2. Database schema (migrations)

Tables, all with RLS enabled, GRANT to `authenticated`, policies allowing any authenticated user to CRUD (internal team model):

- `clients` — `id, client_code (unique), client_name, phone, email, timestamps`
- `cases` — `id, client_id (fk), case_type (enum: trademark|ntn|copyright|company), case_number, status, timestamps`
- `trademarks` — `id, case_id (fk unique), application_name, application_address, application_class, applicant_name, trading_as, applicant_address, trademark_number, folder_number, google_drive_link, assigning_type, current_phase (1–4), timestamps`
- `ntn_details`, `copyright_details`, `company_details` — type-specific detail tables (stub fields per spec; expand later)
- `case_phases` — `id, case_id, phase_number, phase_status, payment_clear, remarks, started_at, completed_at, updated_at`
- `agents` — `id, agent_name, phone, notes`
- `assignments` — `id, case_id, agent_id, assigned_date, completion_date, status, remarks`
- `payments` — `id, case_id, phase_number, payment_required, payment_clear, amount, payment_date, remarks`
- `drive_folders` — `id, case_id, folder_number, folder_name, google_drive_folder_id, google_drive_link, created_at`
- `user_drive_connections` — `id, user_id (fk auth.users), connection_id, created_at` (stores per-user Google Drive connectionId)

Indexes: `trademarks.trademark_number`, `trademarks.application_name`, `clients.client_code`, `cases.case_number`, `trademarks.applicant_name`.

Status options stored as a TypeScript config file (`src/config/phase-statuses.ts`) — not hardcoded in components.

## 3. Server functions

`src/lib/*.functions.ts` modules:

- `clients.functions.ts` — list / get / create / update / delete clients; auto-generate `client_code` (e.g. X726) if not provided
- `cases.functions.ts` — list cases (filter by client/type/status), create case, update status
- `trademarks.functions.ts` — create/update trademark detail, advance phase (validates payment clearance), update phase status
- `agents.functions.ts` & `assignments.functions.ts` — CRUD + assign agent to case
- `payments.functions.ts` — record payment, mark clear
- `search.functions.ts` — unified search across trademark_number / application_name / client_code / case_number / applicant_name / trading_as
- `drive.functions.ts` — start Google OAuth, persist connection, create client folder, create case folder under client folder, list folders
- `reports.functions.ts` — dashboard counts (cases per phase, pending payments, recent activity)

## 4. Google Drive integration

- Add `src/integrations/lovable/appUserConnector.ts` + `appUserConnectorClient.ts` (per template).
- Settings page → "Connect Google Drive" button → popup OAuth via Lovable connector gateway (`connectorId: "google"`, Drive scope).
- After connect, store `connectionId` against user.
- Folder workflow: when creating a client → create root folder named after `client_code`. When creating a case → either select an existing subfolder or create new one named like `X726-001 ABC SHOES TM678668 C25`. Both via Drive API through `callAsAppUser`.
- Requires user-provided `GOOGLE_APP_USER_CONNECTOR_CLIENT_ID` secret (will request after build via add_secret).

## 5. Routes / UI

Dashboard shell: top header (search bar + user menu) + collapsible left sidebar.

Sidebar items: Dashboard, Clients, Trademark, NTN, Copyright, Company, Agents, Assignments, Payments, Reports, Settings.

Public routes:
- `/login`, `/signup`

Protected routes under `_authenticated`:
- `/` — dashboard: KPIs (open cases, phase distribution, pending payments, recent activity), quick search
- `/clients` — list + create; `/clients/$clientId` — client detail with their cases
- `/trademark` — table of trademark cases (searchable, filterable by phase/status)
- `/trademark/new` — create wizard (client → case → trademark details → Drive folder → start phase 1)
- `/trademark/$caseId` — **the core page** with the spec's layout:
  - Top: client code, trademark number, application name, current phase, current status
  - Middle: 4-phase timeline (Filed → Examination → Published → Certificate) with status updates, "Advance phase" button gated by payment clearance
  - Right: Drive folder card, documents, assigned agent, payment status
- `/ntn`, `/copyright`, `/company` — analogous list + detail (lighter, type-specific fields)
- `/agents`, `/assignments`, `/payments`, `/reports`
- `/settings` — Drive connection, profile

Global search (cmd-K palette) hits `search.functions.ts`.

## 6. Design tokens

`src/styles.css`:
- `--background: oklch(0.98 0.01 95)` (warm cream-tinted)
- `--foreground: oklch(0.22 0.05 160)` (deep emerald-black)
- `--primary: oklch(0.32 0.08 160)` (#064e3b emerald)
- `--accent: oklch(0.72 0.12 85)` (#c9a84c gold)
- `--card: oklch(0.99 0.005 95)`
- Outfit / Figtree loaded from Google Fonts in `__root.tsx` head.

## 7. Build order

1. Enable Lovable Cloud + email auth + write all schema migrations with RLS/GRANTs
2. Apply Emerald Prestige theme tokens + fonts
3. Auth (login/signup, `_authenticated` layout, bearer attacher)
4. Dashboard shell (sidebar + header + cmd-K search)
5. Clients module (CRUD + auto code)
6. Cases + Trademark module (full create wizard + detail page with phase timeline)
7. Payments + Agents + Assignments
8. NTN / Copyright / Company stubs
9. Reports dashboard
10. Google Drive connector + folder automation (requests `GOOGLE_APP_USER_CONNECTOR_CLIENT_ID` secret)
11. Seed a couple of demo records for verification

## 8. Out of scope (future, per spec §25)

WhatsApp/email reminders, invoice/PDF generation, activity logs, multi-user permissions/roles, IPO automation. Schema leaves room to add later without migration breakage.
