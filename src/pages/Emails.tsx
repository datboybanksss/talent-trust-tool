import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Search, 
  Filter,
  ArrowRight,
  ArrowLeft,
  Clock,
  Paperclip,
  Star,
  Archive,
  Trash2,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Emails = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  return (
    <DashboardLayout 
      title="Email Log" 
      subtitle="Track all communications sent to and from your account"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Email Items */}
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={cn(
                  "w-full p-4 text-left transition-colors hover:bg-secondary/50",
                  selectedEmail?.id === email.id && "bg-secondary",
                  !email.read && "bg-gold/5"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={cn(
                    "font-medium text-sm truncate",
                    !email.read && "text-foreground",
                    email.read && "text-muted-foreground"
                  )}>
                    {email.direction === "outgoing" ? `To: ${email.recipient}` : `From: ${email.sender}`}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{email.time}</span>
                </div>
                <p className={cn(
                  "text-sm font-medium truncate mb-1",
                  !email.read ? "text-foreground" : "text-muted-foreground"
                )}>
                  {email.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
                <div className="flex items-center gap-2 mt-2">
                  {email.direction === "outgoing" ? (
                    <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Sent
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-info/20 text-info text-xs rounded-full flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" />
                      Received
                    </span>
                  )}
                  {email.hasAttachment && (
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {selectedEmail.direction === "outgoing" 
                          ? `To: ${selectedEmail.recipient}` 
                          : `From: ${selectedEmail.sender}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedEmail.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Archive className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {selectedEmail.direction === "outgoing" && (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      selectedEmail.status === "delivered" && "bg-success/20 text-success",
                      selectedEmail.status === "opened" && "bg-info/20 text-info",
                      selectedEmail.status === "pending" && "bg-warning/20 text-warning"
                    )}>
                      {selectedEmail.status === "delivered" && "✓ Delivered"}
                      {selectedEmail.status === "opened" && "👁 Opened"}
                      {selectedEmail.status === "pending" && "⏳ Pending"}
                    </span>
                    {selectedEmail.openedAt && (
                      <span className="text-xs text-muted-foreground">
                        Opened: {selectedEmail.openedAt}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-foreground">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
                </div>

                {selectedEmail.hasAttachment && (
                  <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-2">Attachments</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">Document.pdf</span>
                        <span className="text-xs text-muted-foreground">1.2 MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center p-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Select an email</h3>
              <p className="text-sm text-muted-foreground">
                Click on an email from the list to view its contents
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

interface Email {
  id: string;
  subject: string;
  direction: "incoming" | "outgoing";
  sender?: string;
  recipient?: string;
  preview: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
  hasAttachment: boolean;
  status?: "delivered" | "opened" | "pending";
  openedAt?: string;
}

const emails: Email[] = [
  {
    id: "1",
    subject: "Company Registration Confirmation",
    direction: "outgoing",
    recipient: "john.doe@email.com",
    preview: "Your company registration has been submitted successfully...",
    body: `
      <p>Dear John,</p>
      <p>We are pleased to confirm that your company registration documents have been successfully submitted to CIPC.</p>
      <p><strong>Reference Number:</strong> CK2026/001234</p>
      <p>You can expect to receive your registration certificate within 5-10 business days.</p>
      <p>In the meantime, please ensure you have completed the following:</p>
      <ul>
        <li>Uploaded your Memorandum of Incorporation</li>
        <li>Submitted the beneficial ownership declaration</li>
        <li>Paid the required registration fees</li>
      </ul>
      <p>If you have any questions, please don't hesitate to reach out to your dedicated advisor.</p>
      <p>Best regards,<br/>The LegacyBuilder Team</p>
    `,
    time: "2h ago",
    date: "Feb 3, 2026, 10:30 AM",
    read: false,
    hasAttachment: true,
    status: "opened",
    openedAt: "Feb 3, 2026, 11:45 AM",
  },
  {
    id: "2",
    subject: "Annual Return Reminder - Action Required",
    direction: "outgoing",
    recipient: "john.doe@email.com",
    preview: "Your annual return is due in 14 days...",
    body: `
      <p>Dear John,</p>
      <p>This is a reminder that your company's annual return is due on <strong>February 15, 2026</strong>.</p>
      <p>Failure to submit on time may result in penalties and potential deregistration of your company.</p>
      <p>Please log in to your portal and complete the submission at your earliest convenience.</p>
      <p>Best regards,<br/>The LegacyBuilder Team</p>
    `,
    time: "Yesterday",
    date: "Feb 2, 2026, 9:00 AM",
    read: true,
    hasAttachment: false,
    status: "delivered",
  },
  {
    id: "3",
    subject: "Re: Trust Formation Inquiry",
    direction: "incoming",
    sender: "sarah@vdmlegal.co.za",
    preview: "Thank you for your inquiry about trust formation...",
    body: `
      <p>Hi John,</p>
      <p>Thank you for reaching out regarding trust formation for your athletic earnings.</p>
      <p>Based on your situation, I would recommend a discretionary trust structure which offers:</p>
      <ul>
        <li>Flexibility in distributions</li>
        <li>Asset protection from creditors</li>
        <li>Estate planning benefits</li>
      </ul>
      <p>I would be happy to schedule a consultation to discuss this in more detail.</p>
      <p>Best regards,<br/>Sarah van der Merwe</p>
    `,
    time: "2 days ago",
    date: "Feb 1, 2026, 3:15 PM",
    read: true,
    hasAttachment: false,
  },
  {
    id: "4",
    subject: "Welcome to LegacyBuilder",
    direction: "outgoing",
    recipient: "john.doe@email.com",
    preview: "Welcome to LegacyBuilder! We're excited to have you...",
    body: `
      <p>Dear John,</p>
      <p>Welcome to LegacyBuilder! We're thrilled to have you join our community of successful athletes, artists, and entrepreneurs.</p>
      <p>Your personalized portal is now ready. Here's what you can do:</p>
      <ul>
        <li>Complete your profile setup</li>
        <li>Start your company registration journey</li>
        <li>Connect with our strategic advisors</li>
        <li>Access our document vault</li>
      </ul>
      <p>If you need any assistance, our team is here to help.</p>
      <p>Best regards,<br/>The LegacyBuilder Team</p>
    `,
    time: "1 week ago",
    date: "Jan 27, 2026, 10:00 AM",
    read: true,
    hasAttachment: false,
    status: "opened",
    openedAt: "Jan 27, 2026, 10:05 AM",
  },
];

export default Emails;
