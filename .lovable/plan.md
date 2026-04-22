

## Replace the mock-driven Client Detail page with live invitation + activated-user data

### What's actually broken

`/agent-dashboard/client/:clientId` receives the invitation UUID and looks it up in a hard-coded `MOCK_CLIENTS` map keyed by `"1"`/`"2"`/`"4"`. Every real invitation misses → falls to `PENDING_FALLBACK` which hard-codes **Eben Etzebeth, Pending, no data**. That's why every activated client opens to the same Springbok shell. Live Life File queries already exist in the file but are wrapped around dead mock context.

### The fix — one file, surgical replacement

**`src/pages/AgentClientDetail.tsx`**

1. **Delete `MOCK_CLIENTS` and `PENDING_FALLBACK` entirely.**

2. **Load the real invitation row** by `clientId`:
   ```ts
   supabase.from("client_invitations")
     .select("id, client_name, client_email, client_phone, client_type,
              status, activated_user_id, pre_populated_data, created_at, activated_at")
     .eq("id", clientId).single()
   ```

3. **Drive the header from invitation fields**: name, email, phone, type. Status badge uses real `invitation.status` (`pending` / `activated` / `expired`). The "Pending" pill only appears when `activated_user_id IS NULL`.

4. **Pull activated-client context** (only when `activated_user_id` is set) in parallel with the existing Life File fetches:
   - `profiles` row (avatar, location, DOB → age)
   - `agent_deals` rows where `agent_id = me AND client_name = invitation.client_name` → drives Deals tab + Total Deal Value KPI
   - `athlete_endorsements` + `athlete_contracts` if `client_type = 'athlete'` → Active Contracts / Market Value KPIs
   - Existing `fetchBeneficiaries / EmergencyContacts / LifeFileDocuments / LifeFileAssets` already wired — keep.
   - `life_file_shares` row where `owner_id = activated_user_id AND shared_with_user_id = me` → if not `accepted`, gate Life File / Documents tabs behind a "Client has not granted access to this section" empty state instead of a misleading data view.

5. **KPI cards compute from live data, not strings**:
   - Active Deals = count of `agent_deals` with `status IN ('active','negotiating')`
   - Total Deal Value = sum of `value_amount`
   - Compliance = % of life-file documents not expired (computed from `expiry_date`)
   - Social Reach = `profiles.social_followers_total` if present, else "—"
   - Market Value = `profiles.market_value` if present, else "—"

6. **Pending state is honest**: when `status='pending'`, render the existing yellow banner *unchanged*, KPIs show "—", tabs stay empty with a single "Awaiting client activation" message. No more fake bio/team data.

7. **Realtime freshness**: subscribe to `postgres_changes` on `life_file_documents`, `life_file_assets`, `agent_deals` filtered to the activated user → invalidate the local fetch so the page reflects new data within ~1s without a manual refresh. (Pattern from the existing realtime guidance.)

8. **PDF generator** (`generateProfileReport`) — rewire to read from the live state objects instead of `client.deals` / `client.documents`. Same layout, real numbers.

### Migration

None required. All tables and columns exist. Realtime publication needs three additions (additive only, no data change):
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.life_file_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.life_file_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_deals;
```
(If any are already in the publication, the `ADD` is a no-op-with-error — handle by checking `pg_publication_tables` first in the migration.)

### What this fixes for you

- Open Kgosi Banks (activated artist) → header reads "Kgosi Banks", status "Activated", Life File data populates the tabs, deals you've added show in Deals tab, KPIs reflect the real share state.
- Open a still-pending client → still shows "Pending" banner but with their real name/email/type — no more "Eben Etzebeth" ghost.
- Client adds a beneficiary or uploads a doc → your client detail page updates within seconds without refresh.
- Client revokes access → tabs flip to "access not granted" state on next render.

### Files

**Modified**
- `src/pages/AgentClientDetail.tsx` (gut + rebuild around live queries)

**New**
- `supabase/migrations/<ts>_realtime_publish_client_tables.sql` (3 additive `ADD TABLE` statements with existence guard)

### Out of scope (defer)
- Editing client deals/contracts directly from this page (already done in `DealDialog` elsewhere)
- Commission column on this page (waiting on the revenue-capture sprint)
- Demo-data overlay for the 5 demo accounts — they already render through the same live path because their invitations are real rows; no special casing needed

### Verification after deploy
1. Open Kgosi Banks → header "Kgosi Banks · Artist · Activated", deals/docs/beneficiaries reflect what's in the DB.
2. Open a pending invitation → real name in header, "Pending" banner, KPIs show "—".
3. Add a deal for Kgosi from the Pipeline → Deals tab on detail page updates within ~2 seconds (realtime).
4. Sign in as Kgosi in another tab, upload a doc → Documents tab on agent detail page updates without refresh.
5. Generate Report → PDF contains real values, not Springbok placeholders.
6. Demo agent (`agent.demo`) opens any of the 5 demo clients → real seeded data renders, no fallback.
7. Revoke share as the client → agent detail page Life File tab flips to "access not granted" state.

