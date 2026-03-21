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
import { Plus, Trash2, Edit2, Palette, Calendar, Users, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Project {
  id: string;
  title: string;
  project_type: string;
  description: string | null;
  status: string;
  start_date: string | null;
  release_date: string | null;
  budget: number | null;
  currency: string;
  collaborators: string | null;
  platform: string | null;
  notes: string | null;
  created_at: string;
}

const projectTypes = [
  { value: "album", label: "Album" },
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "exhibition", label: "Exhibition" },
  { value: "film", label: "Film / Video" },
  { value: "book", label: "Book" },
  { value: "collaboration", label: "Collaboration" },
  { value: "tour", label: "Tour" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "idea", label: "Idea" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Under Review" },
  { value: "completed", label: "Completed" },
  { value: "released", label: "Released" },
  { value: "archived", label: "Archived" },
];

const CreativePortfolio = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({
    title: "",
    project_type: "album",
    description: "",
    status: "in_progress",
    start_date: "",
    release_date: "",
    budget: "",
    currency: "ZAR",
    collaborators: "",
    platform: "",
    notes: "",
  });

  const fetchProjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("artist_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setProjects(data as Project[]);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const resetForm = () => {
    setForm({ title: "", project_type: "album", description: "", status: "in_progress", start_date: "", release_date: "", budget: "", currency: "ZAR", collaborators: "", platform: "", notes: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!user || !form.title) {
      toast({ title: "Missing fields", description: "Please provide a project title.", variant: "destructive" });
      return;
    }

    const payload = {
      user_id: user.id,
      title: form.title,
      project_type: form.project_type,
      description: form.description || null,
      status: form.status,
      start_date: form.start_date || null,
      release_date: form.release_date || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      currency: form.currency,
      collaborators: form.collaborators || null,
      platform: form.platform || null,
      notes: form.notes || null,
    };

    if (editing) {
      const { error } = await supabase.from("artist_projects").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Project updated" });
    } else {
      const { error } = await supabase.from("artist_projects").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Project added" });
    }

    setDialogOpen(false);
    resetForm();
    fetchProjects();
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title,
      project_type: p.project_type,
      description: p.description || "",
      status: p.status,
      start_date: p.start_date || "",
      release_date: p.release_date || "",
      budget: p.budget?.toString() || "",
      currency: p.currency,
      collaborators: p.collaborators || "",
      platform: p.platform || "",
      notes: p.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("artist_projects").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Project deleted" });
    fetchProjects();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "idea": return "bg-muted text-muted-foreground border-border";
      case "in_progress": return "bg-info/20 text-info border-info/30";
      case "review": return "bg-warning/20 text-warning border-warning/30";
      case "completed": return "bg-success/20 text-success border-success/30";
      case "released": return "bg-gold/20 text-gold border-gold/30";
      case "archived": return "bg-muted text-muted-foreground border-border";
      default: return "";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "released": return "🎉";
      case "completed": return "✅";
      case "in_progress": return "🎨";
      case "idea": return "💡";
      case "review": return "👀";
      default: return "📁";
    }
  };

  const activeCount = projects.filter(p => p.status === "in_progress" || p.status === "review").length;
  const releasedCount = projects.filter(p => p.status === "released" || p.status === "completed").length;

  return (
    <DashboardLayout title="Creative Portfolio 🎨" subtitle="Manage your creative projects, releases, and collaborations">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{releasedCount}</p>
              <p className="text-xs text-muted-foreground">Completed / Released</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Cards */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Project" : "Add New Project"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Debut Album, Gallery Exhibition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.project_type} onValueChange={v => setForm(f => ({ ...f, project_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{projectTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
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
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Release / Due Date</Label>
                    <Input type="date" value={form.release_date} onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget</Label>
                    <Input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="0" />
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
                <div>
                  <Label>Collaborators</Label>
                  <Input value={form.collaborators} onChange={e => setForm(f => ({ ...f, collaborators: e.target.value }))} placeholder="e.g. Producer X, DJ Y" />
                </div>
                <div>
                  <Label>Platform / Venue</Label>
                  <Input value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="e.g. Spotify, Zeitz MOCAA" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." />
                </div>
                <Button onClick={handleSubmit} className="w-full">{editing ? "Update Project" : "Add Project"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No projects yet. Start building your creative portfolio.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Card key={p.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{statusIcon(p.status)}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{p.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{p.project_type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusColor(p.status)}>
                    {p.status.replace("_", " ")}
                  </Badge>
                </div>
                {p.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                )}
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  {p.release_date && (
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Release: {format(new Date(p.release_date), "dd MMM yyyy")}
                    </p>
                  )}
                  {p.collaborators && (
                    <p className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {p.collaborators}
                    </p>
                  )}
                  {p.budget && (
                    <p>Budget: {p.currency} {p.budget.toLocaleString()}</p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1 mt-auto pt-3 border-t border-border">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
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

export default CreativePortfolio;
