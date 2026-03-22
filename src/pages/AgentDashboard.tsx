import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, UserPlus, Copy, CheckCircle2, Clock, Mail, LogOut, Shield } from "lucide-react";

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

const AgentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState<{ role: string; company_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // New invitation form
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientType, setClientType] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/agent-register");
      return;
    }
    initializeAgentProfile();
  }, [user]);

  const initializeAgentProfile = async () => {
    if (!user) return;

    // Check for existing agent profile
    const { data: profile } = await supabase
      .from("agent_manager_profiles")
      .select("role, company_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      setAgentProfile(profile);
    } else {
      // Check for pending agent profile from registration
      const pendingStr = localStorage.getItem("pending_agent_profile");
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        const { error } = await supabase.from("agent_manager_profiles").insert({
          user_id: user.id,
          role: pending.role,
          company_name: pending.companyName,
          registration_number: pending.registrationNumber || null,
          phone: pending.phone || null,
        });
        if (!error) {
          localStorage.removeItem("pending_agent_profile");
          setAgentProfile({ role: pending.role, company_name: pending.companyName });
        }
      } else {
        // Not an agent, redirect
        navigate("/dashboard");
        return;
      }
    }

    fetchInvitations();
    setLoading(false);
  };

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from("client_invitations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInvitations(data);
  };

  const handleCreateInvitation = async () => {
    if (!user || !clientName || !clientEmail || !clientType) return;
    setIsCreating(true);

    const { error } = await supabase.from("client_invitations").insert({
      agent_id: user.id,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || null,
      client_type: clientType,
      pre_populated_data: { notes },
    });

    setIsCreating(false);

    if (error) {
      toast({ title: "Error", description: "Failed to create client invitation.", variant: "destructive" });
    } else {
      toast({ title: "Invitation Created", description: `Activation link ready for ${clientName}.` });
      setClientName(""); setClientEmail(""); setClientPhone(""); setClientType(""); setNotes("");
      setDialogOpen(false);
      fetchInvitations();
    }
  };

  const getActivationUrl = (token: string) => {
    return `${window.location.origin}/activate/${token}`;
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getActivationUrl(token));
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
  const defaultClientType = agentProfile?.role === "athlete_agent" ? "athlete" : "artist";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-gold" />
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

      <div className="container py-8 max-w-5xl mx-auto space-y-8">
        {/* POPIA Notice */}
        <Card className="border-gold/30 bg-gold/5">
          <CardContent className="py-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">POPIA Compliance Notice</p>
              <p className="text-xs text-muted-foreground">
                In accordance with POPIA regulations, you do not have automatic access to your clients' profiles after activation.
                Clients may grant you view access from their own profile settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-foreground">Client Invitations</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <UserPlus className="w-4 h-4 mr-2" /> New Client Profile
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
                  <Select value={clientType || defaultClientType} onValueChange={setClientType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="athlete">Athlete</SelectItem>
                      <SelectItem value="artist">Artist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (visible to client)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pre-populated notes for the client..." rows={3} />
                </div>
                <Button variant="gold" className="w-full" onClick={handleCreateInvitation} disabled={isCreating || !clientName || !clientEmail}>
                  {isCreating ? "Creating..." : "Create & Generate Link"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invitations List */}
        {invitations.length === 0 ? (
          <Card className="p-12 text-center">
            <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No client invitations yet. Create your first client profile to get started.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invitations.map((inv) => (
              <Card key={inv.id} className="hover:border-gold/30 transition-colors">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inv.status === "activated" ? "bg-green-100" : "bg-gold/10"}`}>
                      {inv.status === "activated" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gold" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{inv.client_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span>{inv.client_email}</span>
                        <Badge variant={inv.status === "activated" ? "default" : "secondary"} className="text-[10px]">
                          {inv.client_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={inv.status === "activated" ? "default" : "outline"} className={inv.status === "activated" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {inv.status === "activated" ? "Activated" : "Pending"}
                    </Badge>
                    {inv.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => copyLink(inv.invitation_token)}>
                        <Copy className="w-3 h-3 mr-1" /> Copy Link
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
