

## Replace "Market Value" in Create Client Profile

### Problem
The "New Client" dialog (opened from Agent Dashboard) currently asks for a **Market Value** field. This is sports-centric and doesn't apply to artists, executives, or other client types on the roster.

### Replacement
Swap **Market Value** for **Engagement Type** — a select field that captures the commercial relationship the agent has with this client. Universally applicable across athletes, artists, and any future client type.

Options:
- Full Representation
- Commercial Rights Only
- Brand & Endorsements
- Contract Negotiation
- Advisory / Consultation
- Other

Stored as free text in the existing `pre_populated_data` JSONB on `client_invitations` under key `engagement_type` — no schema migration needed.

### Files
**Modified**
- `src/pages/AgentDashboard.tsx` — replace the Market Value input in the New Client dialog with an `Engagement Type` `<Select>`. Update the form state, the insert payload (`pre_populated_data.engagement_type`), and any display of the old value in the invitations list.

### Out of scope
- No schema change (uses existing JSONB column).
- No changes to athlete profile pages — the dedicated Commercial section there keeps its sport-specific market value field.
- No retroactive migration of existing invitation rows.

