

## Work Streams Status — Where We Are

Below is the running ledger across the three work streams from your original brief. Nothing here changes code — it's a status report so you can pick what to do next.

---

### ✅ Work Stream 4 — Wire up "Add New Client" — **DONE**

- New Client dialog lifted to top level of `AgentDashboard`, opens from sidebar Quick Action and from in-tab header button.
- Clients tab routes correctly (no longer triggers the dialog).
- Form writes to `client_invitations` with real `agent_id`, archived rows filtered out.
- "Market Value" replaced with "Engagement Type" select (universal across athlete/artist/exec).
- `MOCK_INVITATIONS` and `MOCK_STATS` removed; KPI cards compute from live invitations.

### ✅ Work Stream 5 — Remove Client (archive flow) — **DONE**

- `client_invitations.archived_at` column added.
- `RemoveClientDialog` archives the invitation (status = `archived`, `archived_at` stamped) and clears the matching `life_file_shares` row.
- Client's own account is left untouched.
- Invitations query filters `archived_at IS NULL`, so removed clients drop off the roster immediately.

### 🟡 Work Stream 6 — Mock Data Purge — **NOT STARTED**

This was deferred pending per-location decisions. Below is the full inventory of remaining mock-data sites I found, grouped by call-site so you can decide each one independently.

| # | Location | Mock source | Suggested direction |
|---|---|---|---|
| 1 | `pages/AgentAthleteProfile.tsx` | `mockAthleteProfiles` | Replace with live `athlete_profiles` query keyed off `client_invitation_id` (biggest job — 10 tabs of fields). |
| 2 | `pages/AgentClientDetail.tsx` | `mockBeneficiaries`, `mockEmergencyContacts`, `mockDocuments`, `mockAssets` from `mockLifeFileData` | Reuse the live `life_file_*` services already powering the client-side Life File. |
| 3 | `components/dashboard/LifeFileSummaryCard.tsx` | `mockAssets` from `mockLifeFileData` | Point at `lifeFileAssetService` for the signed-in user. |
| 4 | `components/executive/*` (Revenue, BookValue, Overhead, Demographics) + `utils/executiveFilters.ts` | `executiveMockData` | Largest unknown — needs an aggregation strategy. Options: (a) leave as illustrative demo data behind an `is_demo` flag, (b) build real aggregation views over `client_invitations` + `agent_deals`, (c) hide section until data exists. |
| 5 | `components/guardian/*` (Overview, Access, Consent, Audit tabs) | `mockGuardianData` | Wire to real `guardian_*` tables (these exist per memory) — CRUD probably already partial. |
| 6 | `components/life-file/ImportFromIntegrationsDialog.tsx` | `mockConnectedAccounts`, `AVAILABLE_PROVIDERS` from `mockIntegrationData` | Per `mem://features/financial-integrations`, integrations are intentionally a waitlist/simulator. Likely **keep as-is** and label clearly. |

### Recommendation

Tackle WS6 in this order, one PR at a time:

1. **#3 LifeFileSummaryCard** — smallest, isolated, high user-visibility on the client dashboard.
2. **#2 AgentClientDetail** — reuses existing services, no new schema.
3. **#5 Guardian tabs** — schema already exists, mostly query wiring.
4. **#1 AgentAthleteProfile** — biggest; needs `athlete_profiles` schema design first if not already built.
5. **#4 Executive dashboard** — decide strategy before touching code (ask first).
6. **#6 Integrations dialog** — likely no action; just confirm "demo by design" labelling.

Tell me which one to start on and I'll come back with a focused plan for that single location.

