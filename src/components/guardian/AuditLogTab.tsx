import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";

interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  share_created: "Share Created",
  share_revoked: "Share Revoked",
  share_accepted: "Share Accepted",
  share_declined: "Share Declined",
  share_deleted: "Share Deleted",
  data_export: "Data Exported",
  account_deletion: "Account Deleted",
};

const actionColors: Record<string, "default" | "secondary" | "outline"> = {
  share_created: "default",
  share_accepted: "default",
  share_revoked: "secondary",
  share_declined: "secondary",
  share_deleted: "outline",
  data_export: "outline",
  account_deletion: "secondary",
};

const formatDetails = (entry: AuditEntry): string => {
  const meta = entry.metadata || {};
  switch (entry.action) {
    case "share_created":
      return `Shared Life File with ${meta.shared_with_email || "unknown"} (${meta.access_level || "view"} access)`;
    case "share_revoked":
      return "Revoked a Life File share";
    case "share_accepted":
      return "Accepted a Life File share invitation";
    case "share_declined":
      return "Declined a Life File share invitation";
    case "share_deleted":
      return "Deleted a Life File share";
    case "data_export":
      return "Exported all personal data";
    case "account_deletion":
      return `Account deletion processed for ${meta.email || "unknown"}`;
    default:
      return entry.action.replace(/_/g, " ");
  }
};

const AuditLogTab = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAuditLog = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Failed to fetch audit log:", error);
      } else {
        setEntries((data || []) as AuditEntry[]);
      }
      setLoading(false);
    };

    fetchAuditLog();
  }, [user]);

  return (
    <div className="space-y-6 mt-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Audit Log</h2>
        <p className="text-xs text-muted-foreground">Complete, immutable record of all guardian-related actions</p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-primary" /> Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No audit log entries yet. Actions like sharing, exporting, and revoking access will appear here.
            </p>
          ) : (
            <div className="relative space-y-0">
              {entries.map((entry, idx) => (
                <div key={entry.id} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    {idx < entries.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={actionColors[entry.action] || "outline"} className="text-[10px]">
                        {actionLabels[entry.action] || entry.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(entry.created_at), "dd MMM yyyy · HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{formatDetails(entry)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Entity: {entry.entity_type}{entry.entity_id ? ` · ${entry.entity_id.slice(0, 8)}…` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogTab;
