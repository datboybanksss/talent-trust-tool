import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, UserPlus, Copy, CheckCircle2, Clock, Mail, LogOut, Shield,
  Users, TrendingUp, FileText, Calendar, ArrowUpRight, BarChart3, Eye,
  Upload, X, Paperclip
} from "lucide-react";

interface Invitation {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_type: string;
  status: string;
  invitation_token: string;
  created_at: string;
}

// Mock data for UI demonstration
const MOCK_INVITATIONS: Invitation[] = [
  {
    id: "1", client_name: "Siya Kolisi", client_email: "siya@example.com",
    client_phone: "+27 81 234 5678", client_type: "athlete", status: "activated",
    invitation_token: "tok_abc123", created_at: "2026-03-15T10:00:00Z",
  },
  {
    id: "2", client_name: "Zozibini Tunzi", client_email: "zozi@example.com",
    client_phone: "+27 82 345 6789", client_type: "artist", status: "activated",
    invitation_token: "tok_def456", created_at: "2026-03-12T14:30:00Z",
  },
  {
    id: "3", client_name: "Kagiso Rabada", client_email: "kagiso@example.com",
    client_phone: "+27 83 456 7890", client_type: "athlete", status: "pending",
    invitation_token: "tok_ghi789", created_at: "2026-03-20T09:15:00Z",
  },
  {
    id: "4", client_name: "Tyla Seethal", client_email: "tyla@example.com",
    client_phone: "+27 84 567 8901", client_type: "artist", status: "activated",
    invitation_token: "tok_jkl012", created_at: "2026-03-08T16:45:00Z",
  },
  {
    id: "5", client_name: "Eben Etzebeth", client_email: "eben@example.com",
    client_phone: "+27 85 678 9012", client_type: "athlete", status: "pending",
    invitation_token: "tok_mno345", created_at: "2026-03-21T11:00:00Z",
  },
];

const MOCK_STATS = {
  totalClients: 5,
  activated: 3,
  pending: 2,
  documentsUploaded: 14,
};

const MOCK_RECENT_ACTIVITY = [
  { action: "Profile activated", client: "Tyla Seethal", time: "2 hours ago", icon: CheckCircle2 },
  { action: "Invitation sent", client: "Eben Etzebeth", time: "5 hours ago", icon: Mail },
  { action: "Document uploaded", client: "Siya Kolisi", time: "1 day ago", icon: FileText },
  { action: "Profile activated", client: "Zozibini Tunzi", time: "3 days ago", icon: CheckCircle2 },
];

const AgentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>(MOCK_INVITATIONS);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState<{ role: string; company_name: string } | null>({
    role: "athlete_agent",
    company_name: "Roc Nation Sports SA",
  });
  const [loading, setLoading] = useState(false);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientType, setClientType] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      // For demo, don't redirect
    } else {
      initializeAgentProfile();
    }
  }, [user]);

  const initializeAgentProfile = async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from("agent_manager_profiles")
      .select("role, company_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      setAgentProfile(profile);
      fetchInvitations();
    }
  };

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from("client_invitations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data && data.length > 0) setInvitations(data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 20 * 1024 * 1024; // 20MB
    const validFiles = files.filter(f => f.size <= maxSize);
    if (validFiles.length < files.length) {
      toast({ title: "File too large", description: "Files must be under 20MB each.", variant: "destructive" });
    }
    setUploadedFiles(prev => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateInvitation = async () => {
    if (!clientName || !clientEmail || !clientType) return;
    setIsCreating(true);

    // Upload files first if any
    const documentsMeta: { file_name: string; storage_path: string; document_type: string }[] = [];

    if (user && uploadedFiles.length > 0) {
      setIsUploading(true);
      for (const file of uploadedFiles) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("agent-client-documents")
          .upload(filePath, file);
        if (!uploadError) {
          documentsMeta.push({
            file_name: file.name,
            storage_path: filePath,
            document_type: file.name.toLowerCase().includes("contract") ? "contract" : "compliance",
          });
        }
      }
      setIsUploading(false);
    }

    if (user) {
      const { error } = await supabase.from("client_invitations").insert({
        agent_id: user.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || null,
        client_type: clientType,
        pre_populated_data: { notes, documents: documentsMeta },
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create invitation.", variant: "destructive" });
        setIsCreating(false);
        return;
      }
    }

    // Add to local state for demo
    const newInvitation: Invitation = {
      id: Date.now().toString(),
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || null,
      client_type: clientType,
      status: "pending",
      invitation_token: `tok_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setInvitations((prev) => [newInvitation, ...prev]);
    setIsCreating(false);
    const docCount = uploadedFiles.length;
    toast({
      title: "Invitation Created",
      description: `Activation link ready for ${clientName}${docCount > 0 ? ` with ${docCount} document${docCount > 1 ? "s" : ""}` : ""}.`,
    });
    setClientName(""); setClientEmail(""); setClientPhone(""); setClientType(""); setNotes("");
    setUploadedFiles([]);
    setDialogOpen(false);
    fetchInvitations();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/activate/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Activation link copied to clipboard." });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const roleLabel = agentProfile?.role === "athlete_agent" ? "Athletes' Agent" : "Artists' Manager";
  const activatedCount = invitations.filter((i) => i.status === "activated").length;
  const pendingCount = invitations.filter((i) => i.status === "pending").length;
  const activationRate = invitations.length > 0 ? Math.round((activatedCount / invitations.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">Agent Portal</h1>
              <p className="text-xs text-muted-foreground">{roleLabel} — {agentProfile?.company_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container py-8 max-w-6xl mx-auto space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{invitations.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Clients</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{activatedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Activated Profiles</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Awaiting</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending Activations</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{activationRate}%</p>
              <div className="mt-2">
                <Progress value={activationRate} className="h-1.5" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Activation Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* POPIA Notice */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">POPIA Compliance Notice</p>
              <p className="text-xs text-muted-foreground">
                You do not have automatic access to your clients' profiles after activation. 
                Clients may grant you view-only access from their own profile settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Client List — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">Client Invitations</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus className="w-4 h-4 mr-2" /> New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Client Profile</DialogTitle>
                    <DialogDescription>
                      Pre-populate your client's profile. They will receive an activation link to claim it.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Client Name *</Label>
                      <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <Label>Client Email *</Label>
                      <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@email.com" />
                    </div>
                    <div>
                      <Label>Client Phone</Label>
                      <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+27..." />
                    </div>
                    <div>
                      <Label>Client Type *</Label>
                      <Select value={clientType || "athlete"} onValueChange={setClientType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="athlete">Athlete</SelectItem>
                          <SelectItem value="artist">Artist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes (visible to client)</Label>
                      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pre-populated notes..." rows={3} />
                    </div>

                    {/* Document Upload */}
                    <div>
                      <Label>Documents (contracts, compliance)</Label>
                      <div className="mt-1.5 border border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="agent-doc-upload"
                        />
                        <label htmlFor="agent-doc-upload" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload or drag files here
                          </span>
                          <span className="text-xs text-muted-foreground">PDF, DOC, JPG, PNG — max 20MB each</span>
                        </label>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 text-sm">
                              <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate text-foreground flex-1">{file.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {(file.size / 1024).toFixed(0)}KB
                              </span>
                              <button onClick={() => removeFile(idx)} className="shrink-0 hover:text-destructive transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreateInvitation} disabled={isCreating || !clientName || !clientEmail}>
                      {isCreating ? (isUploading ? "Uploading documents..." : "Creating...") : `Create & Generate Link${uploadedFiles.length > 0 ? ` (${uploadedFiles.length} files)` : ""}`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {invitations.map((inv) => {
                const initials = inv.client_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                const isActivated = inv.status === "activated";
                const date = new Date(inv.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

                return (
                  <Card key={inv.id} className="hover:border-primary/30 transition-all duration-200 hover:shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${
                          isActivated
                            ? "bg-green-500/10 text-green-700"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{inv.client_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{inv.client_email}</span>
                            </span>
                            <span className="hidden sm:inline">·</span>
                            <span className="hidden sm:inline">{date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {inv.client_type}
                        </Badge>
                        <Badge
                          variant={isActivated ? "default" : "outline"}
                          className={isActivated
                            ? "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10"
                            : "text-amber-600 border-amber-200"
                          }
                        >
                          {isActivated ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" />Active</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" />Pending</>
                          )}
                        </Badge>
                        {!isActivated && (
                          <Button variant="outline" size="sm" onClick={() => copyLink(inv.invitation_token)} className="hidden sm:flex">
                            <Copy className="w-3 h-3 mr-1" /> Copy Link
                          </Button>
                        )}
                        {isActivated && (
                          <Button variant="ghost" size="sm" className="text-muted-foreground hidden sm:flex" disabled>
                            <Eye className="w-3 h-3 mr-1" /> No Access
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {MOCK_RECENT_ACTIVITY.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <activity.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.client} · {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2 text-primary" /> Add New Client
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" disabled>
                    <FileText className="w-4 h-4 mr-2 text-primary" /> Bulk Import Clients
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" disabled>
                    <Mail className="w-4 h-4 mr-2 text-primary" /> Resend All Pending
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Client Breakdown */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Client Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Athletes", count: invitations.filter((i) => i.client_type === "athlete").length, color: "bg-primary" },
                    { label: "Artists", count: invitations.filter((i) => i.client_type === "artist").length, color: "bg-accent" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${invitations.length > 0 ? (item.count / invitations.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
