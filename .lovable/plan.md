

## Deal Pipeline: add/edit/remove deals + live status

### Problem
`DealPipeline.tsx` renders a hardcoded `ALL_PIPELINE_DEALS` array. Agents can't add, edit, remove, or move deals between stages. There's no underlying table — this is pure mock data.

### Solution
Create a real `agent_deals` table owned by the agent, replace the mock array with a Supabase query, and add full CRUD plus stage-change controls.

---

### 1. Schema (new migration)

New table `agent_deals`:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `agent_id` | uuid | `auth.uid()` — owner |
| `client_invitation_id` | uuid nullable | FK-style link to a roster client (optional, free-text fallback) |
| `client_name` | text | denormalized for display |
| `client_type` | text | `athlete` / `artist` |
| `brand` | text | counterparty / brand |
| `deal_type` | text | e.g. Endorsement, Player Contract |
| `value_text` | text | free-form ("R2,500,000/yr") to match current display |
| `value_amount` | numeric nullable | for future totals |
| `currency` | text | default `ZAR` |
| `start_date` | date nullable |  |
| `end_date` | date nullable |  |
| `status` | text | one of: `prospecting`, `proposal_sent`, `negotiating`, `active`, `closed_won`, `closed_lost` (default `prospecting`) |
| `notes` | text nullable |  |
| `created_at` / `updated_at` | timestamptz |  |

RLS — agent-owned only:
- SELECT / INSERT / UPDATE / DELETE: `auth.uid() = agent_id`

Index: `(agent_id, status)` for kanban queries.

### 2. Component changes — `src/components/dashboard/DealPipeline.tsx`

- Remove the `ALL_PIPELINE_DEALS` constant.
- Fetch via React Query: `select * from agent_deals where agent_id = auth.uid() order by created_at desc`.
- Keep the existing 6-stage kanban layout and color scheme.
- Add header bar above the kanban with:
  - Title "Deal Pipeline"
  - Primary `+ Add Deal` button (opens dialog).
- On each deal card, add a small overflow menu (`MoreHorizontal` icon) with:
  - **Edit** — opens dialog pre-filled
  - **Move to stage** — submenu listing the other 5 statuses (one-click stage change)
  - **Delete** — confirm dialog, then DELETE
- Card click still navigates to the client detail page when `client_invitation_id` is set; otherwise click is a no-op (edit via menu).
- Empty pipeline: show empty state card "No deals yet — click Add Deal to start tracking your pipeline."
- Empty stage column: keep existing "No deals" message.

### 3. New component — `src/components/dashboard/DealDialog.tsx`

Single dialog used for both create and edit (mode inferred from presence of `dealId` prop).

Fields (react-hook-form + zod):
- **Client** — select dropdown populated from agent's `client_invitations` (active, non-archived). Includes "Other (manual entry)" option that reveals a free-text `client_name` + `client_type` select.
- **Brand** (required, trimmed)
- **Deal type** (required, free text with suggestions: Endorsement, Sponsorship, Player Contract, Brand Ambassador, Image Rights, etc.)
- **Value** (required, free-text e.g. "R2,500,000/yr")
- **Status** (required select — 6 stages, default `prospecting`)
- **Start date** / **End date** (optional, date pickers)
- **Notes** (optional textarea)

Behaviour:
- Submit disabled until required fields valid.
- On create: INSERT with `agent_id = auth.uid()`.
- On edit: UPDATE by id.
- On success: toast, close dialog, invalidate deals query.
- On failure: toast error, keep dialog open, preserve form state.

### 4. New component — `src/components/dashboard/DeleteDealDialog.tsx`

AlertDialog with deal title in body, destructive confirm "Delete deal". On confirm: DELETE by id, toast, invalidate query.

### 5. Status-change helper

Inline mutation triggered from the card overflow menu's "Move to stage" submenu — UPDATE `status` only, optimistic invalidate. Toast: "Moved to {stage label}."

### 6. Stats cards above kanban

Keep the existing 3 summary cards (Total / In Pipeline / Won-Active) but compute from the live query result. Empty pipeline shows zeros, not hidden.

---

### Files

**Created**
- `supabase/migrations/<ts>_create_agent_deals.sql` — table + RLS + index
- `src/components/dashboard/DealDialog.tsx` — create/edit form
- `src/components/dashboard/DeleteDealDialog.tsx` — confirm delete

**Modified**
- `src/components/dashboard/DealPipeline.tsx` — remove mock array, wire to live query, add header CTA + per-card menu

### Out of scope
- No drag-and-drop between columns (status change is via menu — DnD can be a follow-up).
- No changes to `AgentDashboard.tsx` routing or any other page.
- No backfill/seeding of demo deals — new agents start with empty pipeline (intentional, matches WS6 mock-data purge direction).
- No links to `athlete_contracts` / `athlete_endorsements` (those remain client-side records; agent pipeline is a separate CRM-style view).

