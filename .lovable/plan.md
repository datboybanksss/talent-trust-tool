

## Fix: Staff sees no data because `activated_at` is NULL

### Root cause

The RLS function `staff_has_section()` requires `status = 'active'` AND `confidentiality_accepted_at IS NOT NULL` AND `activated_at IS NOT NULL`. Naledi's active staff row in Kgosi's agency has the first two set but `activated_at` is NULL, so every staff RLS check returns false and she sees an empty dashboard.

The activation flow in `StaffActivate.tsx` splits the work into two updates:
1. `acceptInvitation()` writes `staff_user_id` + `activated_at`
2. `ConfidentialityGate` writes `status='active'` + `confidentiality_accepted_at`

When step 1 runs against a stale row id (Kgosi sent two invites to the same email — there are two `portal_staff_access` rows) or fails silently, only step 2's update sticks, leaving `activated_at` null on the row that's marked active.

She also has a duplicate pending invite (both rows are for the same email + same agency).

### The fix (4 small changes)

1. **`ConfidentialityGate.tsx` — make it self-healing.** Add `activated_at: new Date().toISOString()` to the existing UPDATE so the single row that gets marked active *always* has all three RLS fields set in one atomic write. Eliminates the split-update race forever.

2. **`StaffActivate.tsx` — collapse to one write.** Remove `acceptInvitation()`'s `activated_at` write (it now happens in the gate). Keep the `staff_user_id` link write. This guarantees one row, one final UPDATE.

3. **Patch Naledi's live data.** Set `activated_at = now()` on her active row (`ee39cb5e…`) so she immediately sees Kgosi's data without re-doing the flow. Delete the duplicate pending row (`e093d47f…`) so future logic isn't confused by two invites for the same email.

4. **Add a uniqueness guard.** Add a partial unique index on `portal_staff_access (agent_id, lower(staff_email)) WHERE status <> 'revoked'` so an owner can never accidentally create two active/pending invites for the same email again.

### What Naledi will see after the fix

Kgosi's agency has 1 activated client (`Kgosi Banks`, artist) and 0 deals/meetings yet. Once `activated_at` is set:
- Sidebar badge: "Staff of MVP Builder Talent Agency · Personal Assistant"
- Banner: edit access for clients, pipeline, calendar, compare, templates
- **Clients tab:** the activated client invitation appears
- **Pipeline / Calendar:** empty (no data exists yet) — but as soon as Kgosi or Naledi adds a deal/meeting, both see it instantly with attribution chips
- Any uploaded client documents from Kgosi appear in the client detail view

### Files changed

- `src/components/agent/ConfidentialityGate.tsx` (add `activated_at` to UPDATE)
- `src/pages/StaffActivate.tsx` (drop redundant `activated_at` from acceptInvitation)
- Migration: partial unique index on `portal_staff_access`
- Data patch (insert tool): set Naledi's `activated_at`, delete duplicate pending row

### Verification

1. Sign in as `naledintsane01@gmail.com` → land on `/agent-dashboard` → Clients tab shows "Kgosi Banks" (activated artist).
2. Owner Kgosi adds a test deal → Naledi sees it within 30s with attribution.
3. Naledi adds a deal → Kgosi sees it with "Added by naledi ntsane (Personal Assistant) · just now".
4. Try inviting the same staff email twice from MyAgency → second invite blocked by unique index with a clear error.

