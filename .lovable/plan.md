

## Purge remaining mock data: Executive Overview, Compare, Calendar

### Problem
Three areas still render hardcoded mock data instead of the agent's real records, which corrupts reports and makes the UI lie to the user:

1. **Executive Overview** (`components/executive/*` + `utils/executiveFilters.ts` + `data/executiveMockData.ts`) — KPIs, Book Value, Revenue Analytics, Demographics, Overhead all read from `executiveMockData.ts`. The PDF export (`executiveOverviewPdf.ts`) also pulls from these constants.
2. **Compare** (`components/dashboard/ClientComparison.tsx`) — currently renders a fixed comparison set of mock clients.
3. **Calendar** (`components/agent/AgentCalendar.tsx`) — renders mock events instead of real `shared_meetings` / `compliance_reminders`.

### Solution — wire each to live agent-owned data

#### 1. Executive Overview
Aggregate from real tables the agent already owns:
- `client_invitations` (active, non-archived) → Total Clients, New Clients YTD, client-type & demographic splits
- `agent_deals` → Revenue Streams (group by `deal_type`), Book Value (sum `value_amount` by `client_type`), Top Clients (sum by `client_name`), monthly revenue series (group by `start_date` month), Concentration Risk (top-3 share)
- Derived: Revenue Growth (this period vs prior), Avg Revenue / Client, Client Retention (1 − archived/total)

Replace `executiveMockData.ts` consumers:
- Rewrite `utils/executiveFilters.ts` exports (`getFilteredKPIs`, `getFilteredClientTypeValues`, `getFilteredRevenueStreams`, demographics, overhead) to take **live datasets** + `ExecutiveFilters` and compute in-memory.
- Add a single React Query hook `useExecutiveData(filters)` that fetches invitations + deals once and memoizes all derived slices.
- Each section component (`ExecutiveKPICards`, `BookValueSection`, `RevenueAnalytics`, `DemographicsSection`, `OverheadSection`) reads from this hook.
- Empty-state cards when there's no data ("Add deals and clients to populate this view").

**Overhead section**: no real cost-tracking table exists. Two options — chosen approach: **hide the Overhead tab entirely** until a future cost-tracking feature lands. (Alternative would be a new `agent_overhead_entries` table; out of scope for this pass.)

**Drill-Down sheet** (`DrillDownSheet.tsx` + `executiveDrillDownData.ts`): rewrite to filter the live deals/invitations arrays by the clicked segment instead of reading the mock drill-down file.

**PDF export**: update `executiveOverviewPdf.ts` to accept the live aggregated payload as an argument.

Files touched:
- Modify: all of `src/components/executive/*`, `src/utils/executiveFilters.ts`, `src/utils/executiveOverviewPdf.ts`, `src/utils/executiveReportPdf.ts`, `src/pages/ExecutiveOverview.tsx`
- Create: `src/hooks/useExecutiveData.ts`
- Delete: `src/data/executiveMockData.ts`, `src/data/executiveDrillDownData.ts`
- Hide Overhead tab in `ExecutiveOverviewInline.tsx`

#### 2. Compare (Client Comparison)
Rewrite `ClientComparison.tsx` to:
- Pull the agent's real `client_invitations` (status `active`, archived_at null) as the selectable pool.
- For each selected client, load their `agent_deals` totals (count, sum of `value_amount`, latest deal status) and — when the client has activated and shared their Life File — their Life File summary (assets, beneficiaries count) via the existing share-aware policies.
- Multi-select up to 4 clients via a combobox; render a side-by-side comparison table with the live metrics.
- Empty state: "Add at least 2 clients to compare."

No mock array, no `executiveMockData` imports.

#### 3. Calendar (Agent)
Rewrite `AgentCalendar.tsx` to:
- Query `shared_meetings` where the current agent is `created_by` OR in `attendee_user_ids`.
- Query `compliance_reminders` where `user_id = auth.uid()` and overlay them as date markers.
- Replace the mock event list with a live month/week view backed by these two sources.
- Add an "Add Event" button that inserts into `shared_meetings` (creator = agent, attendees = empty by default; client picker optional).
- Edit/delete via existing RLS (creator-only).
- Empty-state day: "No events scheduled."

Files touched:
- Modify: `src/components/agent/AgentCalendar.tsx`
- Reuse: existing `shared_meetings` and `compliance_reminders` tables — no schema changes.

### Out of scope
- No new `agent_overhead_entries` table (Overhead tab hidden, not rebuilt).
- No drag-and-drop on the calendar.
- No edit-deal-from-Compare-view flow.
- Mock data in `AgentAthleteProfile`, `AgentClientDetail`, `LifeFileSummaryCard`, `Guardian` tabs, `ImportFromIntegrationsDialog` — already addressed in earlier passes; not revisited here.

### Verification
- New agent with zero data: every section shows an empty state, no fake numbers.
- Add a deal → Executive Overview KPIs, Book Value pie, Revenue Analytics bars all update.
- Add a `shared_meeting` → it appears on Calendar immediately.
- Select 2+ clients in Compare → live deal totals render; deselect → table updates.
- PDF export uses live data only.

