import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  metadata: Record<string, any> | null;
  member_name: string;
  member_role: string;
  user_id: string;
}

interface Member { user_id: string; name: string; role: string; }

const PAGE_SIZE = 20;

const ACTION_LABEL: Record<string, string> = {
  deal_created: "added deal",
  deal_updated: "updated deal",
  deal_deleted: "deleted deal",
  invitation_created: "invited client",
  invitation_resent: "resent invitation to",
  meeting_created: "added meeting",
  meeting_deleted: "removed meeting",
};

const formatEntry = (e: ActivityEntry): string => {
  const verb = ACTION_LABEL[e.action] ?? e.action.replace(/_/g, " ");
  const meta = e.metadata ?? {};
  const subject =
    meta.brand && meta.client_name
      ? `'${meta.brand} — ${meta.client_name}'`
      : meta.client_name
      ? `'${meta.client_name}'`
      : meta.title
      ? `'${meta.title}'`
      : meta.label
      ? `'${meta.label}'`
      : "";
  return `${verb} ${subject}`.trim();
};

const WorkspaceActivityPanel = () => {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

  const fetchPage = async (before: string | null = null, append = false) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("get-workspace-activity", {
      body: {
        before,
        member_filter: memberFilter === "all" ? null : memberFilter,
        action_filter: actionFilter === "all" ? null : actionFilter,
        limit: PAGE_SIZE,
      },
    });
    setLoading(false);
    if (error || !data) return;
    let next: ActivityEntry[] = data.entries ?? [];
    if (dateRange !== "all") {
      const days = parseInt(dateRange, 10);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      next = next.filter((e) => new Date(e.created_at).getTime() >= cutoff);
    }
    setHasMore((data.entries ?? []).length === PAGE_SIZE);
    setEntries((prev) => (append ? [...prev, ...next] : next));
    setMembers(data.members ?? []);
  };

  useEffect(() => {
    fetchPage(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberFilter, actionFilter, dateRange]);

  const exportCSV = () => {
    const rows = [
      ["Timestamp", "Member", "Role", "Action", "Subject"],
      ...entries.map((e) => [
        new Date(e.created_at).toISOString(),
        e.member_name,
        e.member_role,
        e.action,
        formatEntry(e),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workspace-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const oldestTs = useMemo(
    () => (entries.length ? entries[entries.length - 1].created_at : null),
    [entries],
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-display">Workspace Activity</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={entries.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Every action performed by you and your staff in this workspace.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="All members" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>{m.name} ({m.role})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="resent">Resent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entries */}
        <div className="space-y-2">
          {loading && entries.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading activity…
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No activity yet for these filters.
            </p>
          ) : (
            entries.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40 border border-border/30"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
                  {e.member_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground leading-snug">
                    <span className="font-medium">{e.member_name}</span>{" "}
                    <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1 align-middle">
                      {e.member_role}
                    </Badge>{" "}
                    {formatEntry(e)}
                  </p>
                  <p
                    className="text-[11px] text-muted-foreground mt-0.5"
                    title={new Date(e.created_at).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && entries.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPage(oldestTs, true)}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Load more
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkspaceActivityPanel;