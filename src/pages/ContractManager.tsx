import { useState, useEffect, useRef } from "react";
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
import { Plus, FileText, Trash2, Edit2, Calendar, DollarSign, Upload, Download, X, Paperclip, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Contract {
  id: string;
  title: string;
  contract_type: string;
  counterparty: string;
  start_date: string;
  end_date: string | null;
  value: number | null;
  currency: string;
  status: string;
  notes: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

const contractTypes = [
  { value: "team", label: "Team Contract" },
  { value: "endorsement", label: "Endorsement" },
  { value: "agency", label: "Agency Agreement" },
  { value: "licensing", label: "Licensing Deal" },
  { value: "appearance", label: "Appearance Fee" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
];

const ContractManager = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    contract_type: "team",
    counterparty: "",
    start_date: "",
    end_date: "",
    value: "",
    currency: "ZAR",
    status: "active",
    notes: "",
  });

  const fetchContracts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("athlete_contracts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setContracts(data as Contract[]);
    setLoading(false);
  };

  useEffect(() => { fetchContracts(); }, [user]);

  const resetForm = () => {
    setForm({ title: "", contract_type: "team", counterparty: "", start_date: "", end_date: "", value: "", currency: "ZAR", status: "active", notes: "" });
    setEditingContract(null);
    setSelectedFile(null);
  };

  const uploadFile = async (contractId: string): Promise<{ url: string; name: string } | null> => {
    if (!selectedFile || !user) return null;

    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${user.id}/${contractId}.${fileExt}`;

    const { error } = await supabase.storage
      .from("contract-files")
      .upload(filePath, selectedFile, { upsert: true });

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }

    return { url: filePath, name: selectedFile.name };
  };

  const handleSubmit = async () => {
    if (!user || !form.title || !form.counterparty || !form.start_date) {
      toast({ title: "Missing fields", description: "Please fill in required fields.", variant: "destructive" });
      return;
    }

    setUploading(true);

    const payload: Record<string, unknown> = {
      user_id: user.id,
      title: form.title,
      contract_type: form.contract_type,
      counterparty: form.counterparty,
      start_date: form.start_date,
      end_date: form.end_date || null,
      value: form.value ? parseFloat(form.value) : null,
      currency: form.currency,
      status: form.status,
      notes: form.notes || null,
    };

    if (editingContract) {
      if (selectedFile) {
        const result = await uploadFile(editingContract.id);
        if (result) {
          payload.file_url = result.url;
          payload.file_name = result.name;
        }
      }

      const { error } = await supabase.from("athlete_contracts").update(payload).eq("id", editingContract.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setUploading(false); return; }
      toast({ title: "Contract updated" });
    } else {
      const { data, error } = await supabase.from("athlete_contracts").insert(payload).select("id").single();
      if (error || !data) { toast({ title: "Error", description: error?.message || "Insert failed", variant: "destructive" }); setUploading(false); return; }

      if (selectedFile) {
        const result = await uploadFile(data.id);
        if (result) {
          await supabase.from("athlete_contracts").update({ file_url: result.url, file_name: result.name }).eq("id", data.id);
        }
      }
      toast({ title: "Contract added" });
    }

    setUploading(false);
    setDialogOpen(false);
    resetForm();
    fetchContracts();
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setForm({
      title: contract.title,
      contract_type: contract.contract_type,
      counterparty: contract.counterparty,
      start_date: contract.start_date,
      end_date: contract.end_date || "",
      value: contract.value?.toString() || "",
      currency: contract.currency,
      status: contract.status,
      notes: contract.notes || "",
    });
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, fileUrl: string | null) => {
    if (fileUrl) {
      await supabase.storage.from("contract-files").remove([fileUrl]);
    }
    const { error } = await supabase.from("athlete_contracts").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Contract deleted" });
    fetchContracts();
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("contract-files").download(fileUrl);
    if (error || !data) {
      toast({ title: "Download failed", description: error?.message || "File not found", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemoveFile = async (contract: Contract) => {
    if (!contract.file_url) return;
    await supabase.storage.from("contract-files").remove([contract.file_url]);
    await supabase.from("athlete_contracts").update({ file_url: null, file_name: null }).eq("id", contract.id);
    toast({ title: "File removed" });
    fetchContracts();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/20 text-success border-success/30";
      case "pending": return "bg-warning/20 text-warning border-warning/30";
      case "expired": return "bg-muted text-muted-foreground border-border";
      case "terminated": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "";
    }
  };

  const totalValue = contracts.filter(c => c.status === "active").reduce((sum, c) => sum + (c.value || 0), 0);
  const activeCount = contracts.filter(c => c.status === "active").length;

  return (
    <DashboardLayout title="Contract Manager 🏆" subtitle="Track and manage all your athletic contracts">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{contracts.length}</p>
              <p className="text-xs text-muted-foreground">Total Contracts</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Contracts</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R {totalValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Active Contract Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Button + Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Your Contracts</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Contract</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingContract ? "Edit Contract" : "Add New Contract"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Team Contract 2026" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.contract_type} onValueChange={v => setForm(f => ({ ...f, contract_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{contractTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
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
                <div>
                  <Label>Counterparty *</Label>
                  <Input value={form.counterparty} onChange={e => setForm(f => ({ ...f, counterparty: e.target.value }))} placeholder="e.g. Nike, Manchester United" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Value</Label>
                    <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0" />
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

                {/* File Upload */}
                <div>
                  <Label>Contract File (PDF)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {editingContract?.file_name && !selectedFile ? (
                    <div className="flex items-center gap-2 mt-2 p-3 rounded-lg border border-border bg-muted/30">
                      <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{editingContract.file_name}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveFile(editingContract)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex items-center gap-2 mt-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
                      <Paperclip className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{selectedFile.name}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full mt-2 gap-2 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </Button>
                  )}
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
                  {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingContract ? "Update Contract" : "Add Contract"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No contracts yet. Add your first contract to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map(contract => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell className="capitalize">{contract.contract_type.replace("_", " ")}</TableCell>
                    <TableCell>{contract.counterparty}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(contract.start_date), "MMM yyyy")}
                      {contract.end_date ? ` — ${format(new Date(contract.end_date), "MMM yyyy")}` : " — Ongoing"}
                    </TableCell>
                    <TableCell>
                      {contract.value ? `${contract.currency} ${contract.value.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell>
                      {contract.file_name ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-primary h-8 px-2"
                          onClick={() => handleDownload(contract.file_url!, contract.file_name!)}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="max-w-[80px] truncate text-xs">{contract.file_name}</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor(contract.status)}>{contract.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(contract)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(contract.id, contract.file_url)}>
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

export default ContractManager;