import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye, 
  Edit3, 
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SharedPerson {
  id: string;
  email: string;
  name?: string;
  relationship: string;
  accessType: "view" | "edit" | "manage";
  status: "pending" | "accepted" | "revoked";
  sharedAt: string;
}

const Sharing = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState("family");
  const [inviteAccessType, setInviteAccessType] = useState<"view" | "edit" | "manage">("view");

  // Mock data - will be replaced with real data from Supabase
  const [sharedPeople, setSharedPeople] = useState<SharedPerson[]>([
    {
      id: "1",
      email: "spouse@email.com",
      name: "Jane Doe",
      relationship: "family",
      accessType: "manage",
      status: "accepted",
      sharedAt: "Jan 15, 2026",
    },
    {
      id: "2",
      email: "advisor@legacybuilder.co.za",
      name: "Michael Smith",
      relationship: "advisor",
      accessType: "view",
      status: "accepted",
      sharedAt: "Jan 10, 2026",
    },
    {
      id: "3",
      email: "accountant@firm.co.za",
      relationship: "accountant",
      accessType: "view",
      status: "pending",
      sharedAt: "Jan 20, 2026",
    },
  ]);

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address to invite.",
        variant: "destructive",
      });
      return;
    }

    const newPerson: SharedPerson = {
      id: Date.now().toString(),
      email: inviteEmail,
      relationship: inviteRelationship,
      accessType: inviteAccessType,
      status: "pending",
      sharedAt: new Date().toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      }),
    };

    setSharedPeople([...sharedPeople, newPerson]);
    setInviteEmail("");
    setInviteRelationship("family");
    setInviteAccessType("view");
    setIsInviteOpen(false);

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail}`,
    });
  };

  const handleRevoke = (id: string) => {
    setSharedPeople(sharedPeople.filter(p => p.id !== id));
    toast({
      title: "Access revoked",
      description: "The person's access has been removed.",
    });
  };

  const handleUpdateAccess = (id: string, accessType: "view" | "edit" | "manage") => {
    setSharedPeople(sharedPeople.map(p => 
      p.id === id ? { ...p, accessType } : p
    ));
    toast({
      title: "Access updated",
      description: "The person's access level has been updated.",
    });
  };

  const filteredPeople = sharedPeople.filter(person =>
    person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const relationshipLabels: Record<string, string> = {
    family: "Family Member",
    advisor: "Advisor",
    accountant: "Accountant",
    lawyer: "Lawyer",
    agent: "Agent/Manager",
    other: "Other",
  };

  const accessTypeIcons: Record<string, React.ReactNode> = {
    view: <Eye className="w-4 h-4" />,
    edit: <Edit3 className="w-4 h-4" />,
    manage: <Shield className="w-4 h-4" />,
  };

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    pending: { icon: <Clock className="w-4 h-4" />, color: "text-yellow-500", label: "Pending" },
    accepted: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500", label: "Active" },
    revoked: { icon: <XCircle className="w-4 h-4" />, color: "text-red-500", label: "Revoked" },
  };

  return (
    <DashboardLayout 
      title="Sharing & Access" 
      subtitle="Manage who can view your documents and profile information"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{sharedPeople.length}</p>
                <p className="text-sm text-muted-foreground">People with access</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {sharedPeople.filter(p => p.status === "accepted").length}
                </p>
                <p className="text-sm text-muted-foreground">Active shares</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {sharedPeople.filter(p => p.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending invites</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or relationship..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <UserPlus className="w-4 h-4" />
                    Invite Someone
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite Someone</DialogTitle>
                    <DialogDescription>
                      Share access to your documents and profile with a family member, advisor, or trusted person.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Select value={inviteRelationship} onValueChange={setInviteRelationship}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="family">Family Member</SelectItem>
                          <SelectItem value="advisor">Advisor</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                          <SelectItem value="lawyer">Lawyer</SelectItem>
                          <SelectItem value="agent">Agent/Manager</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select value={inviteAccessType} onValueChange={(v) => setInviteAccessType(v as "view" | "edit" | "manage")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>View Only</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="edit">
                            <div className="flex items-center gap-2">
                              <Edit3 className="w-4 h-4" />
                              <span>Can Edit</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="manage">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              <span>Full Access</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {inviteAccessType === "view" && "Can view documents and profile information only."}
                        {inviteAccessType === "edit" && "Can view and edit documents and profile information."}
                        {inviteAccessType === "manage" && "Full access including managing other shares."}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="gold" onClick={handleInvite}>
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary text-sm font-medium text-muted-foreground">
            <div className="col-span-4">Person</div>
            <div className="col-span-2">Relationship</div>
            <div className="col-span-2">Access</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {filteredPeople.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-1">No shared access yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite family members or advisors to share access to your documents.
                </p>
                <Button variant="gold" onClick={() => setIsInviteOpen(true)}>
                  <UserPlus className="w-4 h-4" />
                  Invite Someone
                </Button>
              </div>
            ) : (
              filteredPeople.map((person) => (
                <div key={person.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/50 transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {person.name ? person.name.charAt(0) : person.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {person.name || person.email}
                      </p>
                      {person.name && (
                        <p className="text-sm text-muted-foreground truncate">{person.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      {relationshipLabels[person.relationship] || person.relationship}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <Select 
                      value={person.accessType} 
                      onValueChange={(v) => handleUpdateAccess(person.id, v as "view" | "edit" | "manage")}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="manage">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3" />
                            <span>Manage</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <div className={cn("flex items-center gap-1.5", statusConfig[person.status].color)}>
                      {statusConfig[person.status].icon}
                      <span className="text-sm">{statusConfig[person.status].label}</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevoke(person.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">About Sharing Access</h4>
              <p className="text-sm text-muted-foreground">
                When you share access, the invited person will receive an email invitation. 
                They'll need to create an account or sign in to view your shared documents. 
                You can revoke access at any time, and all shared data remains encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sharing;
