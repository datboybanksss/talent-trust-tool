

# LegacyBuilder Platform — Gap Analysis & Code Access

## How to Get All the Code

You have two options:

1. **Connect to GitHub** — Go to **Project Settings → GitHub → Connect project**. This creates a GitHub repository with all your code. You can then clone it locally with `git clone`, download it as a ZIP from GitHub, or work on it in any IDE.

2. **Download via GitHub** — Once connected, go to your GitHub repo and click **Code → Download ZIP** to get the entire codebase.

Your database data can be exported separately from **Cloud → Database → Tables → select table → export button**.

---

## What Is Missing to Make the Platform Fully Functional

### Critical — Must Fix

| # | Gap | Details |
|---|-----|---------|
| 1 | **No password reset flow** | There is no "Forgot Password" link, no reset email trigger, and no `/reset-password` page. Users who forget their password are locked out. |
| 2 | **No Google OAuth sign-in** | Auth only supports email/password. Google sign-in should be added for convenience and security. |
| 3 | **No email verification enforcement** | Auto-confirm is enabled. Users can sign up with fake emails. Should require email verification before access. |
| 4 | **Mock data throughout** | Pages still use hardcoded mock data instead of real database queries: **Agent Dashboard** (clients list), **Documents**, **Sharing**, **Social Media**, **Apply for Funding**, **Financial Integrations**, **Guardian Management**, **Life File** (falls back to mock). These need to be wired to real database tables. |
| 5 | **No role-based access control** | No `user_roles` table. Admin dashboard (`/admin`) and Executive Overview (`/executive-overview`) are accessible to any authenticated user. Agent vs. Client roles are not enforced server-side. |
| 6 | **Missing RLS policies audit** | Several tables may lack proper Row-Level Security. Need to verify all tables enforce `user_id = auth.uid()` policies. |

### Important — Core Feature Gaps

| # | Gap | Details |
|---|-----|---------|
| 7 | **Contact form doesn't send emails** | The Contact page collects data but has no edge function or email service to actually deliver it. |
| 8 | **File uploads not fully wired** | Storage bucket `life-file-documents` exists but document uploads across Documents, Contracts, Endorsements, and Creative Portfolio pages may not be connected to real storage. |
| 9 | **Financial Integrations are mock-only** | The integration page shows mock connections (FNB, Luno, etc.) but has no real API connectivity. Need at minimum a clear "coming soon" state or actual Open Banking integration (e.g., Stitch). |
| 10 | **Notifications/Reminders don't fire** | Compliance reminders and document expiry alerts have edge functions but no scheduled trigger (cron). Emails depend on Resend but may not be configured. |
| 11 | **Sharing/Collaboration is mock** | The Sharing page and Life File sharing use mock data. Real shared access queries and invitation emails are not implemented. |
| 12 | **Social Media passwords stored in plain text** | The `social_media_accounts` table stores passwords as plain strings. This is a major security risk — should use encryption or remove password storage entirely. |

### Nice to Have — Polish & Completeness

| # | Gap | Details |
|---|-----|---------|
| 13 | **No loading/empty states** | Many pages jump straight to mock data. Need proper skeleton loaders and "no data yet" empty states. |
| 14 | **No mobile responsiveness audit** | The app has desktop-first layouts. Sidebar navigation, tables, and multi-column layouts may break on mobile. |
| 15 | **No onboarding wizard** | After signup, users land on the dashboard with no guided setup. A step-by-step onboarding would improve activation. |
| 16 | **Subscription/pricing not enforced** | Tier badges display but no payment gateway (Stripe) is connected. Feature gating by tier is not implemented. |
| 17 | **PDF exports use mock data** | Estate Calculator, Life File, and Executive reports generate PDFs but may use mock figures instead of the user's real data. |
| 18 | **No data backup/export for users** | Users cannot export all their data (GDPR/POPIA compliance requirement for a SA platform). |

---

## Recommended Implementation Order

1. Password reset + Google OAuth + email verification (auth hardening)
2. Role-based access control (admin, agent, client roles)
3. Replace mock data with real database queries across all pages
4. Wire up Contact form email delivery
5. File upload completion across all modules
6. Notification/reminder cron scheduling
7. Stripe integration for subscription enforcement
8. Security audit (RLS policies, social media password encryption)
9. Mobile responsiveness pass
10. Real financial integrations (Open Banking)

