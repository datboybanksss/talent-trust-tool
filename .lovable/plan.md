

## Populate MyAgency with seed data for your current account

**What this does:** inserts one row into `agent_manager_profiles` linked to your currently signed-in user so the `/myagency` page renders fully populated instead of the empty state. No schema changes, no impact on other accounts, no impact on real agents like `agent.demo@…`.

### What gets inserted

A single row with the following placeholder values (you can edit any of them in the page itself once it loads):

| Field | Seed value |
|---|---|
| `user_id` | your current `auth.uid()` |
| `company_name` | "MVP Builder Talent Agency" |
| `registration_number` | "2024/123456/07" |
| `role` | `athlete_agent` |
| `phone` | "+27812345678" |
| `logo_url` | `null` (you can upload one from the page) |

### How

Single SQL insert via the data tool, guarded with `ON CONFLICT (user_id) DO NOTHING` so it's safe to re-run and won't duplicate if a row already exists.

```sql
INSERT INTO public.agent_manager_profiles
  (user_id, company_name, registration_number, role, phone)
VALUES
  (auth.uid(), 'MVP Builder Talent Agency', '2024/123456/07', 'athlete_agent', '+27812345678')
ON CONFLICT (user_id) DO NOTHING;
```

(If a unique constraint on `user_id` doesn't exist, I'll fall back to a `WHERE NOT EXISTS` guard — same effect.)

### After insert

- Refresh `/myagency` → identity header, stats row, and POPIA panel all render with data.
- The stats row will likely show **0 clients** (your account has no `client_invitations` or `life_file_shares` rows as an agent) — that's expected and confirms Stream 2 will need real data for full preview.
- To clean up later: either use the page's "Delete agency account" flow, or ask me to remove it.

### Out of scope

- No change to the page code, the RPC, the bucket, or any other account.
- No seeding of `client_invitations` / `life_file_shares` (separate request if you want fake clients to appear in the stats).

