# Talent Trust Tool / Legacy Builder — Claude Code Context

## Project summary
Legacy Builder is a wealth management platform for South African athletes, artists, and their agents/managers. Live at themvpbuilder.co.za.

Tech stack: React + TypeScript + Tailwind + shadcn/ui frontend, Supabase (Lovable Cloud) backend. Deployed via Lovable — GitHub is source of truth, Lovable picks up commits and deploys on Publish.

## Architecture
Three user types: agency owners, their staff (PAs, accountants, lawyers), and clients (athletes/artists).

Agency = workspace. Owner creates it, invites staff with section permissions. Staff with grants get full CRUD on agency-scoped tables (agent_deals, client_invitations, shared_meetings). Client-owned tables (athlete_contracts, athlete_endorsements, artist_royalties, artist_projects) are read-only for staff — deliberate.

Demo profiles use is_demo=true on profiles. delete-agent-account RPC has server-side is_demo guard.

## Critical files
- src/hooks/useUserRole.tsx — identity-tied role resolution
- src/hooks/useAgencyScope.tsx — scopedAgentId + canEdit/canDelete
- src/hooks/useStaffAccess.tsx — staff membership + revocation Realtime
- src/hooks/useAccountSetupGate.tsx — self-heals missing agent_manager_profiles, routes to /welcome if unconfigured
- src/components/AgentRoute.tsx, ProtectedRoute.tsx — depend on the gate
- supabase/migrations/ — additive-only, timestamped

## Working principles
1. Additive migrations only. Never drop columns, never modify existing RLS — always ADD.
2. is_demo protection on all destructive ops (UI disable + tooltip AND server RPC guard).
3. Agency-scoped writes use scopedAgentId, NOT user.id. Stamp created_by/updated_by with user.id for attribution.
4. POPIA framing: "remove your access" != "delete client data." Never conflate.
5. Mobile-first is non-negotiable.

## Known drift pattern
This project has a documented history of "approved-but-not-shipped" drift. Before declaring any work complete, verify files contain the specific changes — read them, confirm PRESENT / PARTIAL / MISSING per item.

## Working style
Direct, results-focused. Show diffs before writing files. Push back on scope creep. One task at a time, shipped and verified, before moving to next.
