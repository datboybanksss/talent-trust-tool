

## Work Stream B: Full Data Wiring — Phase 1 (Client-Side Pages)

### What
Replace hardcoded mock data with real database-backed CRUD across the client dashboard pages. The Life File module is already partially wired (it fetches from Supabase but falls back to mock data) — this phase finishes that work and extends the same pattern to the other client pages.

### Scope — Phase 1 (this task)

We will wire **3 high-priority client pages** that users interact with most:

1. **Life File** — Remove mock fallback; show empty states instead of fake data when no records exist
2. **Social Media Accounts** — Wire to `social_media_accounts` table (already exists); replace inline mock array with real fetch/insert/update/delete
3. **Documents** — Wire to `life_file_documents` table with file upload to the `life-file-documents` storage bucket; replace the large inline mock array

### How

#### 1. Life File — Remove Mock Fallback
- **`src/pages/LifeFile.tsx`** — Remove the mock fallback logic (lines 158–163). When no data exists, show empty arrays so the UI renders proper empty states ("No beneficiaries yet — add one")
- Remove the import of `mockLifeFileData`
- Add empty-state messaging in each tab when arrays are empty

#### 2. Social Media — Wire to Database
- **`src/pages/SocialMedia.tsx`** — Replace inline mock `useState` array with a `useEffect` that fetches from `social_media_accounts` where `user_id = current user`
- Wire Add form to `supabase.insert()`, Edit to `supabase.update()`, Delete to `supabase.delete()`
- Add loading spinner and empty state
- Remove all inline mock data

#### 3. Documents — Wire to Database + Storage
- **`src/pages/Documents.tsx`** — Replace `initialDocuments` mock array with real fetch from `life_file_documents`
- Wire the upload dialog to upload files to the `life-file-documents` storage bucket then insert a row
- Wire delete to remove both the storage object and the DB row
- Add loading state and empty state per category
- The existing `payslip_tax_documents` table may need to be unified or queried alongside

### What stays for Phase 2
- Agent Dashboard, Agent Client Detail, Agent Athlete Profile (mock client lists)
- Sharing page, Apply for Funding, Financial Integrations
- Executive Overview mock data

### Files Modified
- `src/pages/LifeFile.tsx` — remove mock fallback
- `src/pages/SocialMedia.tsx` — full CRUD wiring
- `src/pages/Documents.tsx` — full CRUD wiring + storage upload
- No new database tables needed (all tables already exist)

### Technical Notes
- All three tables (`social_media_accounts`, `life_file_documents`, `beneficiaries`, etc.) already have RLS policies tied to `user_id`
- The `life-file-documents` storage bucket already exists (private)
- The existing service layer in `src/services/` provides the pattern for Life File; Social Media and Documents will get similar inline Supabase calls or new service files

