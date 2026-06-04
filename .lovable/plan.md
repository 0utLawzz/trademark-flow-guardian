
# Restructure: New schema + new navigation

## 1. Database migration (destructive)

Drop the old business tables and replace with the new schema. The current tables (`clients`, `cases`, `trademarks`, `case_phases`, `payments`, `agents`, `assignments`, `ntn_details`, `copyright_details`, `company_details`, `drive_folders`) are empty scaffolding, so we'll drop and rebuild rather than migrate.

Keep: `user_drive_connections`, auth, helpers.

### New tables

**clients**
- `id` uuid PK
- `client_prefix` text (`X`, `A`, `N`, …)
- `client_code` int (e.g. 202)
- `client_name`, `trading_as`, `address`, `city` text
- unique (`client_prefix`, `client_code`)
- timestamps

**attorneys**
- `id`, `name`, `address`, `city`, `created_at`

**applications** (core)
- `id` uuid PK
- `folder_number` text unique — auto-generated `{prefix}-{client_code}-{seq}` e.g. `X-202-010` (seq = per-client running number, padded 3)
- `trademark_number` text nullable (6 digits, added later)
- `client_id` → clients
- `service_type` text default `Trademark` (also supports `Copyright`, `Company`, `NTN`)
- `application_name`, `mark_description` text
- `applicant_type` text (`Sole Proprietor` | `Company` | `Partners`)
- `applicant_name`, `trading_as`, `applicant_address` text
- `class` text[] (array of class numbers as strings)
- `logo_url` text
- `attorney_id` → attorneys nullable
- `city` text (LHR, KHI, ISB, PES)
- `current_stage` int 1–4 default 1, CHECK 1..4
- `sub_status` text
- `is_complete` bool default false
- `last_operation_date` timestamptz (denormalized for lookup speed; updated by trigger on stage_updates insert)
- timestamps
- indexes: `folder_number`, `trademark_number`, `client_id`, `current_stage`

**stage_updates** (history, append-only)
- `id`, `application_id` → applications (cascade)
- `stage` int 1–4
- `status` text
- `update_date` timestamptz default now
- `file_url`, `notes` text
- `hearing_date` timestamptz nullable
- `journal_no` text nullable
- `tcs_tracking` text nullable
- `created_by` text
- trigger: after insert → update `applications.last_operation_date`, `current_stage` (only if new stage > current), `sub_status`

**stage_payments**
- `id`, `application_id`, `stage` 1–4
- `payment_status` text (`Due`|`Received`|`Balance`)
- `amount` numeric nullable
- `payment_date` timestamptz nullable
- `notes` text
- unique (`application_id`, `stage`)

**assignments**
- `id`, `application_id`, `agent_name`, `city`, `assigned_date`, `status` (`Pending`|`Accepted`|`Rejected`|`Cleared`), `notes`

**journal_entries** (manual log)
- `id`, `journal_no` text, `journal_date` date, `trademark_number` text, `application_name` text, `class` text, `notes` text, timestamps
- index on `trademark_number`

**ipo_entries** (manual log)
- `id`, `entry_date` date, `trademark_number` text, `application_name` text, `class` text, `status` text, `notes` text, timestamps
- index on `trademark_number`

### Helper functions
- `generate_folder_number(client_id uuid)` returns text — looks up prefix+code, finds max seq for that client, returns `{prefix}-{code}-{seq+1:03}`
- Trigger on `stage_updates` insert to bump `applications.current_stage` forward only and refresh `last_operation_date` + `sub_status`
- Guard trigger on `applications` update: reject if new `current_stage` < old `current_stage`

### Stage / sub-status reference (config file `src/config/stages.ts`)
- Stage 1 Filing: Filing Application, Documents Submitted, Examination (R), Under Examination, Examination Replied, Acknowledged, Completed
- Stage 2 Examination & Acceptance: Under Examination, Hearing, Accepted, Rejected, Completed
- Stage 3 Publication & Demand Note: Journal Published, Opposition Received, Opposition Replied, Demand Note (I), Demand Note Submitted, Completed
- Stage 4 Certificate & Dispatch: Certificate (I), Certificate Received, Certificate Dispatched (TCS), Delivered, Completed
- Payment per stage required to advance, **manual override** allowed (UI checkbox)

### RLS
Same internal-team model: all authenticated users full access on every business table. `user_drive_connections` stays user-scoped.

## 2. Server functions
Rewrite/add under `src/lib/`:
- `clients.functions.ts` — list/create/update; create returns id
- `attorneys.functions.ts` — list/create
- `applications.functions.ts` — list (filter by service_type), get by id, create (calls `generate_folder_number`), update, set trademark number, complete
- `stage-updates.functions.ts` — list by app, add new (auto-advances application via trigger)
- `stage-payments.functions.ts` — upsert per stage
- `assignments.functions.ts` — list/create/update
- `lookup.functions.ts` — search by trademark_number → returns minimal payload (folder no, date, name, class, address, status, sub_status, last_operation_date)
- `journal.functions.ts`, `ipo.functions.ts` — list/create/delete; helper `getJournalMatches()` returns app ids whose `trademark_number` appears in journal/ipo (used for alert indicator on app list)

## 3. Navigation / routes

Sidebar order:
1. Dashboard
2. Clients
3. **Applications** (collapsible group)
   - Trademark
   - Copyright
   - Company
   - NTN / Tax Return
4. Operations group:
   - Agents
   - Assignments
   - Payments
   - Reports
5. Tools:
   - Application Lookup
   - Journal
   - IPO
6. Settings

Routes to add/replace under `_authenticated/`:
- `applications.trademark.tsx`, `applications.copyright.tsx`, `applications.company.tsx`, `applications.ntn.tsx` (list pages filtered by service_type with create button + table)
- `applications.$id.tsx` — detail page with stage timeline, sub_status dropdown, payment per stage, file uploads, assignments side panel
- `lookup.tsx` — single search input → result card
- `journal.tsx`, `ipo.tsx` — table + add-row dialog, highlight rows whose trademark_number matches an open application

Remove/replace old `trademark.tsx`, `ntn.tsx`, `copyright.tsx`, `company.tsx` stubs.

Sidebar component updated to render the Applications group as a collapsible submenu using shadcn's `SidebarMenuSub`.

## 4. UI specifics

- **Application list (per service type)**: table with folder_number, trademark_number, applicant_name, class, current_stage badge, sub_status, last_operation_date, journal/ipo alert dot. Filters: stage, complete/open, text search.
- **Application detail**: header (folder + trademark + applicant + class + city), 4-step stage stepper with "Advance to next stage" gated by payment of current stage (override checkbox), stage_updates timeline (add update form: stage/status/date/file/notes/hearing/journal/tcs), payments grid (4 rows, edit each), assignments list.
- **Lookup**: one input (trademark_number), result shows: folder_number, application_name, applicant_name, class, applicant_address, current stage label, sub_status, last_operation_date. Empty state + not-found state.
- **Journal / IPO**: simple table + add dialog. Each row whose `trademark_number` matches an active application gets a gold accent + bell icon.

## 5. Build order

1. Migration: drop old tables, create new schema, helpers, triggers, RLS, GRANTs
2. Config file `src/config/stages.ts` (stages + sub_status options + service types + cities)
3. Server functions for clients/attorneys/applications/stage_updates/stage_payments/assignments/lookup/journal/ipo
4. Sidebar restructure (Applications submenu, Tools group)
5. Clients page (list + create dialog)
6. Application list pages × 4 (shared component, parametrized by service_type)
7. Application detail page (the big one)
8. Lookup page
9. Journal + IPO pages with match-highlighting
10. Wipe dashboard KPIs to point at new tables

## 6. Out of scope this round
Google Drive folder automation hookup (schema removed but can re-add later), reports analytics charts, file upload storage bucket (we'll store URLs only; bucket can come next).

## Confirm before I start
- OK to **drop existing empty tables** (clients, cases, trademarks, case_phases, payments, agents, assignments, ntn_details, copyright_details, company_details, drive_folders)? They have no rows but I want to confirm.
- OK that `service_type` on `applications` covers Copyright/Company/NTN with the same stage/timeline workflow (just different filtering), rather than separate tables per type?
