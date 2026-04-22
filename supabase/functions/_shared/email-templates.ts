// Centralised email template builder for LegacyBuilder platform
// All transactional emails share this branded wrapper.

const BRAND = {
  name: "LegacyBuilder",
  green: "#1B4332",
  gold: "#C9A84C",
  lightGold: "#F5E6C8",
  white: "#FFFFFF",
  grey: "#6B7280",
  lightBg: "#F9FAFB",
  fontHeadline: "'Playfair Display', Georgia, serif",
  fontBody: "'Inter', Arial, sans-serif",
};

function wrap(headline: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${headline}</title></head>
<body style="margin:0;padding:0;background:${BRAND.lightBg};font-family:${BRAND.fontBody};color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.lightBg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BRAND.white};border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<!-- Header -->
<tr><td style="background:${BRAND.green};padding:28px 32px;text-align:center;">
<h1 style="margin:0;font-family:${BRAND.fontHeadline};font-size:24px;color:${BRAND.gold};font-weight:700;">Legacy<span style="color:${BRAND.white};">Builder</span></h1>
</td></tr>
<!-- Body -->
<tr><td style="padding:32px;">
<h2 style="margin:0 0 16px;font-family:${BRAND.fontHeadline};font-size:20px;color:${BRAND.green};">${headline}</h2>
${body}
</td></tr>
<!-- Footer -->
<tr><td style="background:${BRAND.lightBg};padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:12px;color:${BRAND.grey};">© ${new Date().getFullYear()} LegacyBuilder · Protecting What Matters Most</p>
<p style="margin:4px 0 0;font-size:11px;color:${BRAND.grey};">This is an automated message from LegacyBuilder. Please do not reply directly.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">${text}</p>`;
}

function btn(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:${BRAND.green};border-radius:6px;padding:12px 28px;"><a href="${url}" style="color:${BRAND.gold};font-family:${BRAND.fontBody};font-size:15px;font-weight:600;text-decoration:none;">${label}</a></td></tr></table>`;
}

// ── Template exports ──

export function contactFormConfirmationEmail(name: string) {
  return {
    subject: "We received your message — LegacyBuilder",
    html: wrap("Thank you for reaching out", p(`Hi ${name},`) + p("We've received your message and a member of the LegacyBuilder team will get back to you within 48 hours.") + p("If your matter is urgent, please reply to this email with "URGENT" in the subject line.") + p("Warm regards,<br>The LegacyBuilder Team")),
  };
}

export function contactFormNotificationEmail(name: string, email: string, subject: string, message: string) {
  return {
    subject: `New Contact Form: ${subject || "No subject"}`,
    html: wrap("New Contact Submission", p(`<strong>From:</strong> ${name} (${email})`) + p(`<strong>Subject:</strong> ${subject || "—"}`) + `<div style="background:${BRAND.lightBg};padding:16px;border-radius:6px;margin:16px 0;border-left:4px solid ${BRAND.gold};">${p(message)}</div>` + p("Reply directly to the sender's email above.")),
  };
}

export function sharingInviteEmail(ownerName: string, recipientName: string, acceptUrl: string) {
  return {
    subject: `${ownerName} shared their Life File with you — LegacyBuilder`,
    html: wrap("You've been invited", p(`Hi ${recipientName},`) + p(`<strong>${ownerName}</strong> has shared sections of their Life File with you on LegacyBuilder.`) + p("Click below to accept the invitation and view the shared documents.") + btn("Accept Invitation", acceptUrl) + p("If you weren't expecting this, you can safely ignore this email.")),
  };
}

export function complianceReminderEmail(userName: string, title: string, dueDate: string, category: string) {
  return {
    subject: `Compliance reminder: ${title} due ${dueDate}`,
    html: wrap("Compliance Reminder", p(`Hi ${userName},`) + p(`Your compliance obligation <strong>"${title}"</strong> in the <strong>${category}</strong> category is due on <strong>${dueDate}</strong>.`) + p("Please log in to LegacyBuilder to review and complete this item before the deadline.") + p("Staying on top of compliance protects your legacy.")),
  };
}

export function documentExpiryEmail(userName: string, docTitle: string, expiryDate: string, daysRemaining: number) {
  return {
    subject: `Document expiring: ${docTitle} — ${daysRemaining} days remaining`,
    html: wrap("Document Expiry Alert", p(`Hi ${userName},`) + p(`Your document <strong>"${docTitle}"</strong> is set to expire on <strong>${expiryDate}</strong> — that's <strong>${daysRemaining} day${daysRemaining === 1 ? "" : "s"}</strong> from now.`) + p("Please log in to LegacyBuilder to review, renew, or upload an updated version.") + p("Keeping your documents current is essential to protecting your legacy.")),
  };
}

export function dataExportReadyEmail(userName: string, downloadUrl: string) {
  return {
    subject: "Your data export is ready — LegacyBuilder",
    html: wrap("Data Export Ready", p(`Hi ${userName},`) + p("Your personal data export is ready for download.") + btn("Download My Data", downloadUrl) + p("This link will expire in 24 hours for your security. If you did not request this export, please contact support immediately.")),
  };
}

export function accountDeletionConfirmationEmail(userName: string) {
  return {
    subject: "Account deletion request received — LegacyBuilder",
    html: wrap("Account Deletion Requested", p(`Hi ${userName},`) + p("We've received your request to permanently delete your LegacyBuilder account and all associated data.") + p("Your account and data will be permanently removed within 24 hours. This action cannot be undone.") + p("If you did not request this, please contact support immediately.")),
  };
}

export function accountDeletionFinalEmail(userName: string) {
  return {
    subject: "Your account has been deleted — LegacyBuilder",
    html: wrap("Account Deleted", p(`Hi ${userName},`) + p("Your LegacyBuilder account and all associated data have been permanently deleted as requested.") + p("We're sorry to see you go. If you ever want to return, you're welcome to create a new account at any time.") + p("Take care,<br>The LegacyBuilder Team")),
  };
}

export function subscriptionPaymentFailedEmail(userName: string, tierName: string) {
  return {
    subject: "Payment failed — action required — LegacyBuilder",
    html: wrap("Payment Failed", p(`Hi ${userName},`) + p(`We were unable to process payment for your <strong>${tierName}</strong> subscription.`) + p("Please update your payment method within the next 7 days to avoid any interruption to your service.") + p("If you believe this is an error, please contact our support team.")),
  };
}

export function subscriptionCancelledEmail(userName: string, tierName: string) {
  return {
    subject: "Subscription cancelled — LegacyBuilder",
    html: wrap("Subscription Cancelled", p(`Hi ${userName},`) + p(`Your <strong>${tierName}</strong> subscription has been cancelled. You'll continue to have access until the end of your current billing period.`) + p("You can reactivate your subscription at any time from your Profile page.") + p("We hope to see you back soon.")),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your password — LegacyBuilder",
    html: wrap("Password Reset", p("You requested a password reset for your LegacyBuilder account.") + btn("Reset Password", resetUrl) + p("If you didn't request this, you can safely ignore this email. The link expires in 1 hour.")),
  };
}

export function emailVerificationEmail(verifyUrl: string) {
  return {
    subject: "Verify your email — LegacyBuilder",
    html: wrap("Verify Your Email", p("Welcome to LegacyBuilder! Please verify your email address to get started.") + btn("Verify Email", verifyUrl) + p("If you didn't create a LegacyBuilder account, you can safely ignore this email.")),
  };
}

export function twoFactorCodeEmail(code: string) {
  return {
    subject: "Your verification code — LegacyBuilder",
    html: wrap("Your Verification Code", p("Use the code below to complete your sign-in:") + `<div style="text-align:center;margin:24px 0;"><span style="display:inline-block;background:${BRAND.lightBg};border:2px solid ${BRAND.gold};border-radius:8px;padding:16px 32px;font-family:monospace;font-size:32px;letter-spacing:8px;color:${BRAND.green};font-weight:700;">${code}</span></div>` + p("This code expires in 10 minutes. If you didn't try to sign in, please change your password immediately.")),
  };
}

// ── Invitation templates ──

function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return "in the coming days";
  try {
    return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "soon";
  }
}

export interface StaffInvitationEmailInput {
  recipientName: string;
  agencyName: string;
  inviterName: string;
  roleLabel: string;
  sections: string[];
  activationUrl: string;
  expiresAt: string | null;
  isReturningUser: boolean;
}

export function staffInvitationEmail(input: StaffInvitationEmailInput) {
  const sectionsList = input.sections.length > 0
    ? `<ul style="margin:0 0 14px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.6;">${input.sections.map((s) => `<li style="text-transform:capitalize;">${s.replace(/_/g, " ")}</li>`).join("")}</ul>`
    : p("Your access scope will be confirmed by the agent.");
  const greeting = input.isReturningUser
    ? p(`Welcome back, ${input.recipientName}.`)
    : p(`Hi ${input.recipientName},`);
  const intro = input.isReturningUser
    ? p(`<strong>${input.inviterName}</strong> at <strong>${input.agencyName}</strong> has invited you to join their team on LegacyBuilder. Sign in to accept.`)
    : p(`<strong>${input.inviterName}</strong> at <strong>${input.agencyName}</strong> has invited you to join their portal on LegacyBuilder.`);
  const ctaLabel = input.isReturningUser ? "Sign In to Accept" : "Activate My Access";
  return {
    subject: `${input.agencyName} invited you to join their portal on LegacyBuilder`,
    html: wrap(
      "You've been invited to a portal",
      greeting +
      intro +
      p(`<strong>Your role:</strong> ${input.roleLabel}`) +
      p(`<strong>You'll have access to:</strong>`) + sectionsList +
      p(`Before you can access the portal, you'll be asked to acknowledge a brief confidentiality agreement covering POPIA-compliant handling of client data.`) +
      btn(ctaLabel, input.activationUrl) +
      p(`<small>This invitation expires on <strong>${formatExpiry(input.expiresAt)}</strong>.</small>`) +
      p(`<small>If you weren't expecting this invitation, you can safely ignore this email.</small>`)
    ),
  };
}

export interface ClientInvitationEmailInput {
  recipientName: string;
  agencyName: string;
  inviterName: string;
  clientType: string;
  activationUrl: string;
  expiresAt: string | null;
  isReturningUser: boolean;
}

export function clientInvitationEmail(input: ClientInvitationEmailInput) {
  const typeLabel = input.clientType === "artist"
    ? "manage your contracts, royalties, projects, and team — all in one place"
    : "manage your contracts, endorsements, brand deals, and life-file — all in one place";
  const greeting = input.isReturningUser
    ? p(`Welcome back, ${input.recipientName}.`)
    : p(`Hi ${input.recipientName},`);
  const intro = input.isReturningUser
    ? p(`<strong>${input.inviterName}</strong> at <strong>${input.agencyName}</strong> has prepared a LegacyBuilder profile for you. Sign in to claim it.`)
    : p(`<strong>${input.inviterName}</strong> at <strong>${input.agencyName}</strong> has prepared a LegacyBuilder profile for you.`);
  const ctaLabel = input.isReturningUser ? "Sign In to Activate" : "Activate My Profile";
  return {
    subject: `${input.agencyName} has invited you to activate your LegacyBuilder profile`,
    html: wrap(
      "Your LegacyBuilder profile is ready",
      greeting +
      intro +
      p(`LegacyBuilder is your private command centre to ${typeLabel}.`) +
      p(`Your profile has already been pre-populated with details your agent has on file. After activation, <strong>you</strong> own and control all access — your agent will only see what you explicitly share.`) +
      btn(ctaLabel, input.activationUrl) +
      p(`<small>This invitation expires on <strong>${formatExpiry(input.expiresAt)}</strong>.</small>`) +
      p(`<small>If you weren't expecting this invitation, you can safely ignore this email.</small>`)
    ),
  };
}
