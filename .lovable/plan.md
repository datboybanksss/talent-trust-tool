
The user wants the login credentials for the 5 seeded demo profiles. These were defined in the seed-data.ts file I created earlier and saved to memory. No code changes needed — this is a straightforward info request, but the AI mode requires a plan to switch out of read-only.

From `supabase/functions/seed-demo-profiles/seed-data.ts`:

**Password (all 5 accounts):** `DemoSeed!2026#Vault`

**Emails:**
- Athlete — `athlete.demo@themvpbuilder.co.za`
- Agent — `agent.demo@themvpbuilder.co.za`
- Artist — `artist.demo@themvpbuilder.co.za`
- Rugby player — `rugby.demo@themvpbuilder.co.za`
- Sprinter — `sprinter.demo@themvpbuilder.co.za`

**Important caveat:** these accounts only exist in the database after Phase 2 of the seeder runs. Looking at the conversation, Phase 1 (preview) and Phase 2 (`?confirm=true`) require manual `curl` calls with the `DEMO_SEED_ADMIN_TOKEN` header — I have no record they were actually executed yet. I'll quickly verify by querying `auth.users` for the 5 emails before handing over creds, so the user knows whether they can log in right now or still need to run Phase 2.

## Plan

1. Query `auth.users` to check which of the 5 demo emails actually exist (so the user knows whether seeding has run).
2. Reply with:
   - The 5 emails + shared password
   - Status per account (exists / not yet seeded)
   - If not seeded: the two `curl` commands to run Phase 1 then Phase 2
   - Reminder that the `DEMO_SEED_ADMIN_TOKEN` secret value is what they set when approving the secret earlier

No file changes. Pure info + one read query.
