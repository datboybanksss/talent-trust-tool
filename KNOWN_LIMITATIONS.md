# Known Limitations

Canonical "we know about this, it's on the list" doc. Reviewed at sprint planning.

## Staff visibility on agent meetings

Current: all staff with 'calendar' section see all agent-owned meetings + meetings they're personally an attendee of.
Limitation: private meetings (e.g., agent 1:1 with accountant about PA performance) are visible to all staff.
Future fix: add `visibility: 'agency' | 'private' | 'attendees_only'` column to shared_meetings. Default 'agency' for backwards compatibility. UI exposes this as a visibility selector on meeting creation.
Deferred at: 2026-04-22 (staff shared-journey sprint)

## Staff write access

Status: SHIPPED in 2026-04-22 workspace sprint.
Staff with a granted section can now full-CRUD on agency-scoped tables (`agent_deals`, `client_invitations`, `shared_meetings`). Writes are scoped to `agency_id = scopedAgentId` via `useAgencyScope`; attribution is captured in `created_by` / `updated_by` columns and surfaced via `audit_log`.
Owner-only surfaces remain owner-only: `agent_manager_profiles`, `portal_staff_access`, `life_file_shares`, `delete_agent_account` RPC, `MyAgency` page.

## Staff writes on client-owned tables

Current: staff cannot write to client-owned tables (`athlete_contracts`, `athlete_endorsements`, `artist_royalties`, `artist_projects`). These rows are keyed by the client's `user_id`, not the agency's, so the simple "owner OR staff with section" RLS pattern does not apply.
Limitation: a PA cannot add or edit a contract on the client's record — only the client (or owner via existing impersonation paths) can.
Future fix: model decision needed — either chain through `life_file_shares` (PA inherits owner's accepted-share access) or add explicit per-client agent-write grants.
Deferred at: 2026-04-22 (workspace sprint)

## Staff self-activity view

Current: workspace activity log lives in `MyAgency` and is owner-only. Staff cannot see their own action history in the UI.
Future fix: add a "My Activity" view accessible to staff, filtered to actions they personally performed.
Deferred at: 2026-04-22 (workspace sprint)

## Multi-agency switcher

Current: a user belongs to one agency at a time (most-recently-updated active staff row wins; see `useStaffAccess`).
Future fix: agency switcher in the sidebar header when `portal_staff_access` returns >1 active row.
Deferred at: 2026-04-22 (workspace sprint)

## Multi-agency staff switcher

Current: a staff user with active rows for multiple agencies sees only the most-recently-updated active row (`useStaffAccess` ordering: `updated_at desc, limit 1`). No UI to switch between agencies.
Limitation: a freelance PA who works for two sports agencies on the platform cannot view both portfolios in a single session.
Future fix: add an agency switcher in the sidebar header when `portal_staff_access` returns >1 active row; persist selection to localStorage.
Deferred at: 2026-04-22

## Revenue schedule amortisation strategy

Current: not yet implemented. The proposed `agency_costs` + `v_agency_revenue` work was scoped but not built.
Limitation: Executive Overview still tracks gross deal value, not commission-based agency revenue. Costs line on the monthly chart is hard-coded to zero.
Future fix: revenue capture sprint — Option A (amortise contract values evenly across months in window) vs Option B (event-driven `realised_date` only, manual reconciliation). Decision pending.
Deferred at: 2026-04-22

## audit_log per-category visibility for staff

Current: `audit_log` table is admin-only via RLS (`has_role(auth.uid(), 'admin')`).
Limitation: staff cannot see audit history for the agency they're embedded in, even though some categories (e.g., invitation resends, deal moves) would be useful operationally.
Future fix: add a `visibility_scope` column to audit_log (`admin_only` | `agency` | `staff_visible`); extend RLS so staff with `clients` section can read agency-scoped events.
Deferred at: 2026-04-22

## Mock data purge across platform (WS6)

Current: several pages still reference `src/data/mock*.ts` files (`mockAthleteProfiles`, `mockGuardianData`, `mockIntegrationData`, `mockLifeFileData`).
Limitation: certain views render seeded fictional data instead of live database state. Confusing for owners who didn't seed demo data.
Future fix: full audit of mock imports, replace each with live Supabase queries, delete unused mock files.
Deferred at: 2026-04-22

## Sharing.tsx dead mock page

Current: `src/pages/Sharing.tsx` exists but is no longer routed to from primary navigation; uses mock share data.
Limitation: dead code, confusing for future-you.
Future fix: delete file + any lingering references after confirming no inbound links from external docs.
Deferred at: 2026-04-22

## agency_costs VAT + tax-deductible tracking

Current: when the `agency_costs` table is built (revenue capture sprint), columns reserved for `vat_inclusive boolean`, `vat_amount numeric`, `tax_deductible boolean` are noted but not yet implemented.
Limitation: no SARS-aligned tax reporting from cost entries; agents must reconcile externally.
Future fix: include those columns in the initial migration and surface them in the cost entry dialog with a "VAT-inclusive (15%)" toggle.
Deferred at: 2026-04-22

## Dedicated staff dashboard deferred

Current: staff users sign in via `/auth`, are routed to `/agent-dashboard` (via `useUserRole` precedence: admin > agent > staff > client), see all agency-scoped data via `useAgencyScope`, have all write actions hidden via `<OwnerOnly>`, and see a persistent `<StaffContextBanner>` at the top of every page reinforcing "you are assisting {Owner} from {Agency}".
Limitation: staff use the same dashboard layout as agency owners. Information density and section ordering are tuned for principals, not assistants. A PA's most-needed view (today's schedule + action queue) is not the landing surface.
Future fix: a dedicated `/staff` route with PA-specific layout (StaffHeader, StaffStatsRow, TodayScheduleCard, ActionQueueCard, QuickAccessTiles, slimmer StaffSidebar) was designed but deferred. Build AFTER 2–3 real PAs have used the platform for at least a week each — design from observed behaviour, not speculation.
Deferred at: 2026-04-22 (staff routing-fix sprint)
