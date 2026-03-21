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
import { Plus, Trash2, Edit2, Trophy, DollarSign, Handshake, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Endorsement {
  id: string;
  brand_name: string;
  deal_type: string;
  annual_value: number | null;
  currency: string;
  start_date: string;
  end_date: string | null;
  deliverables: string | null;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
}

const dealTypes = [
  { value: "sponsorship", label: "Sponsorship" },
  { value: "ambassador", label: "Brand Ambassador" },
  { value: "product", label: "Product Endorsement" },
  { value: "appearance", label: "Paid Appearance" },
  { value: "social_media", label: "Social Media Campaign" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "negotiating", label: "Negotiating" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
];

const EndorsementTracker = () => {
  const { user } = useAuth();
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Endorsement | null>(null);
  const [form, setForm] = useState({
    brand_name: "",
    deal_type: "sponsorship",
    annual_value: "",
    currency: "ZAR",
    start_date: "",
    end_date: "",
    deliverables: "",
    status: "active",
    contact_name: "",
    contact_email: "",
    notes: "",
  });

  const fetchEndorsements = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("athlete_endorsements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setEndorsements(data as Endorsement[]);
    setLoading(false);
  };

  useEffect(() => { fetchEndorsements(); }, [user]);

  const resetForm = () => {
    setForm({ brand_name: "", deal_type: "sponsorship", annual_value: "", currency: "ZAR", start_date: "", end_date: "", deliverables: "", status: "active", contact_name: "", contact_email: "", notes: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!user || !form.brand_name || !form.start_date) {
      toast({ title: "Missing fields", description: "Please fill in required fields.", variant: "destructive" });
      return;
    }

    const payload = {
      user_id: user.id,
      brand_name: form.brand_name,
      deal_type: form.deal_type,
      annual_value: form.annual_value ? parseFloat(form.annual_value) : null,
      currency: form.currency,
      start_date: form.start_date,
      end_date: form.end_date || null,
      deliverables: form.deliverables || null,
      status: form.status,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      notes: form.notes || null,
    };

    if (editing) {
      const { error } = await supabase.from("athlete_endorsements").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Endorsement updated" });
    } else {
      const { error } = await supabase.from("athlete_endorsements").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Endorsement added" });
    }

    setDialogOpen(false);
    resetForm();
    fetchEndorsements();
  };

  const handleEdit = (e: Endorsement) => {
    setEditing(e);
    setForm({
      brand_name: e.brand_name,
      deal_type: e.deal_type,
      annual_value: e.annual_value?.toString() || "",
      currency: e.currency,
      start_date: e.start_date,
      end_date: e.end_date || "",
      deliverables: e.deliverables || "",
      status: e.status,
      contact_name: e.contact_name || "",
      contact_email: e.contact_email || "",
      notes: e.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("athlete_endorsements").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Endorsement deleted" });
    fetchEndorsements();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/20 text-success border-success/30";
      case "negotiating": return "bg-warning/20 text-warning border-warning/30";
      case "completed": return "bg-info/20 text-info border-info/30";
      case "expired": return "bg-muted text-muted-foreground border-border";
      default: return "";
    }
  };

  const totalAnnualValue = endorsements.filter(e => e.status === "active").reduce((sum, e) => sum + (e.annual_value || 0), 0);
  const activeCount = endorsements.filter(e => e.status === "active").length;
  const negotiatingCount = endorsements.filter(e => e.status === "negotiating").length;

  return (
    <DashboardLayout title="Endorsement Tracker 🤝" subtitle="Monitor your brand deals, sponsorships, and partnerships">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{endorsements.length}</p>
              <p className="text-xs text-muted-foreground">Total Deals</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Deals</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{negotiatingCount}</p>
              <p className="text-xs text-muted-foreground">In Negotiation</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R {totalAnnualValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Annual Endorsement Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Endorsement Cards */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Your Endorsements</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Endorsement</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Endorsement" : "Add New Endorsement"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Brand Name *</Label>
                  <Input value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} placeholder="e.g. Nike, Adidas, Red Bull" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Deal Type</Label>
                    <Select value={form.deal_type} onValueChange={v => setForm(f => ({ ...f, deal_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{dealTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
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
                    <Label>Annual Value</Label>
                    <Input type="number" value={form.annual_value} onChange={e => setForm(f => ({ ...f, annual_value: e.target.value }))} placeholder="0" />
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
                    <Label>Start Date *</Label>
                    <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Deliverables</Label>
                  <Textarea value={form.deliverables} onChange={e => setForm(f => ({ ...f, deliverables: e.target.value }))} placeholder="e.g. 3 social media posts/month, 2 appearances/year" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    <Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Brand rep name" />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="rep@brand.com" />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." />
                </div>
                <Button onClick={handleSubmit} className="w-full">{editing ? "Update Endorsement" : "Add Endorsement"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading endorsements...</p>
        ) : endorsements.length === 0 ? (
          <div className="text-center py-12">
            <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No endorsements yet. Add your first brand deal to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {endorsements.map(e => (
              <Card key={e.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{e.brand_name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{e.deal_type.replace("_", " ")}</p>
                  </div>
                  <Badge variant="outline" className={statusColor(e.status)}>{e.status}</Badge>
                </div>
                {e.annual_value && (
                  <p className="text-lg font-bold text-foreground mb-2">{e.currency} {e.annual_value.toLocaleString()}<span className="text-xs font-normal text-muted-foreground"> /year</span></p>
                )}
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(e.start_date), "MMM yyyy")}
                  {e.end_date ? ` — ${format(new Date(e.end_date), "MMM yyyy")}` : " — Ongoing"}
                </p>
                {e.deliverables && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{e.deliverables}</p>}
                <div className="flex items-center justify-end gap-1 mt-auto pt-4 border-t border-border">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(e)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default EndorsementTracker;
