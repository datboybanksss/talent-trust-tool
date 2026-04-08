
## Task C-urgent: Remove Plain-Text Password Storage from Social Media Accounts

### What
The `social_media_accounts` table stores passwords in plain text — a critical security vulnerability. Remove the `password` column entirely and update the UI to no longer collect, display, or copy passwords.

### How

1. **Database migration** — Drop the `password` column from `social_media_accounts`
   - Also drop `two_factor_backup_codes` (another sensitive field stored in plain text)

2. **Update `SocialMedia.tsx`** — Remove all password-related UI:
   - Remove password field from add/edit forms
   - Remove password display, toggle visibility, and copy-to-clipboard logic
   - Remove backup codes display
   - Add a note recommending users use a dedicated password manager instead

### Files
- `src/pages/SocialMedia.tsx` — modified (remove password UI)
- Database migration — drop `password` and `two_factor_backup_codes` columns
