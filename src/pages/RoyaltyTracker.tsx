import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Music, DollarSign, TrendingUp, BarChart3, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { generateRoyaltiesPDF } from "@/utils/documentPdfExports";

interface Royalty {
  id: string;
  source_name: string;
  source_type: string;
  amount: number;
  currency: string;
  period_start: string;
  period_end: string | null;
  status: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

const sourceTypes = [
  { value: "streaming", label: "Streaming" },
  { value: "samro", label: "SAMRO" },
  { value: "publishing", label: "Publishing" },
  { value: "sync", label: "Sync Licensing" },
  { value: "mechanical", label: "Mechanical" },
  { value: "performance", label: "Performance" },
  { value: "merchandise", label: "Merchandise" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "received", label: "Received" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "disputed", label: "Disputed" },
];

const RoyaltyTracker = () => {
  const { user } = useAuth();
  const [royalties, setRoyalties] = useState<Royalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Royalty | null>(null);
  const [form, setForm] = useState({
    source_name: "",
    source_type: "streaming",
    amount: "",
    currency: "ZAR",
    period_start: "",
    period_end: "",
    status: "received",
    reference_number: "",
    notes: "",
  });

  const fetchRoyalties = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("artist_royalties")
      .select("*")
      .eq("user_id", user.id)
      .order("period_start", { ascending: false });

    if (!error && data) setRoyalties(data as Royalty[]);
    setLoading(false);
  };

  useEffect(() => { fetchRoyalties(); }, [user]);

  const resetForm = () => {
    setForm({ source_name: "", source_type: "streaming", amount: "", currency: "ZAR", period_start: "", period_end: "", status: "received", reference_number: "", notes: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!user || !form.source_name || !form.period_start || !form.amount) {
      toast({ title: "Missing fields", description: "Please fill in required fields.", variant: "destructive" });
      return;
    }

    const payload = {
      user_id: user.id,
      source_name: form.source_name,
      source_type: form.source_type,
      amount: parseFloat(form.amount),
      currency: form.currency,
      period_start: form.period_start,
      period_end: form.period_end || null,
      status: form.status,
      reference_number: form.reference_number || null,
      notes: form.notes || null,
    };

    if (editing) {
      const { error } = await supabase.from("artist_royalties").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Royalty entry updated" });
    } else {
      const { error } = await supabase.from("artist_royalties").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Royalty entry added" });
    }

    setDialogOpen(false);
    resetForm();
    fetchRoyalties();
  };

  const handleEdit = (r: Royalty) => {
    setEditing(r);
    setForm({
      source_name: r.source_name,
      source_type: r.source_type,
      amount: r.amount.toString(),
      currency: r.currency,
      period_start: r.period_start,
      period_end: r.period_end || "",
      status: r.status,
      reference_number: r.reference_number || "",
      notes: r.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("artist_royalties").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Royalty entry deleted" });
    fetchRoyalties();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-success/20 text-success border-success/30";
      case "pending": return "bg-warning/20 text-warning border-warning/30";
      case "processing": return "bg-info/20 text-info border-info/30";
      case "disputed": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "";
    }
  };

  const totalReceived = royalties.filter(r => r.status === "received").reduce((sum, r) => sum + r.amount, 0);
  const totalPending = royalties.filter(r => r.status === "pending" || r.status === "processing").reduce((sum, r) => sum + r.amount, 0);
  const sourceBreakdown = royalties.reduce((acc, r) => {
    acc[r.source_type] = (acc[r.source_type] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);
  const topSource = Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <DashboardLayout title="Royalty Tracker 🎵" subtitle="Monitor all your royalty income streams and payments">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => { generateRoyaltiesPDF(); toast({ title: "PDF downloaded" }); }}>
          <FileDown className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R {totalReceived.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Received</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R {totalPending.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Pending / Processing</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{royalties.length}</p>
              <p className="text-xs text-muted-foreground">Total Entries</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground capitalize">{topSource ? topSource[0] : "—"}</p>
              <p className="text-xs text-muted-foreground">Top Revenue Source</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Royalty Entries</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Royalty</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Royalty Entry" : "Add Royalty Entry"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Source Name *</Label>
                  <Input value={form.source_name} onChange={e => setForm(f => ({ ...f, source_name: e.target.value }))} placeholder="e.g. Spotify, SAMRO, Warner Chappell" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Source Type</Label>
                    <Select value={form.source_type} onValueChange={v => setForm(f => ({ ...f, source_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{sourceTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount *</Label>
                    <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZAR">ZAR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Period Start *</Label>
                    <Input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Period End</Label>
                    <Input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Reference Number</Label>
                  <Input value={form.reference_number} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} placeholder="Payment reference" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." />
                </div>
                <Button onClick={handleSubmit} className="w-full">{editing ? "Update Entry" : "Add Entry"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading royalties...</p>
        ) : royalties.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No royalty entries yet. Start tracking your income streams.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {royalties.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.source_name}</TableCell>
                    <TableCell className="capitalize">{r.source_type.replace("_", " ")}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(r.period_start), "MMM yyyy")}
                      {r.period_end ? ` — ${format(new Date(r.period_end), "MMM yyyy")}` : ""}
                    </TableCell>
                    <TableCell className="font-semibold">{r.currency} {r.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor(r.status)}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.reference_number || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default RoyaltyTracker;
