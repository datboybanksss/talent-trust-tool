import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Linkedin,
  Plus,
  Edit3,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  Users,
  ExternalLink,
  Music2,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  email?: string;
  recovery_email?: string;
  recovery_phone?: string;
  two_factor_enabled: boolean;
  notes?: string;
  follower_count?: number;
  verified: boolean;
  account_status: string;
}

const platformConfig: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  urlPrefix: string;
}> = {
  instagram: { icon: Instagram, color: "text-pink-500", bgColor: "bg-pink-500/10", urlPrefix: "https://instagram.com/" },
  twitter: { icon: Twitter, color: "text-sky-500", bgColor: "bg-sky-500/10", urlPrefix: "https://x.com/" },
  facebook: { icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-600/10", urlPrefix: "https://facebook.com/" },
  youtube: { icon: Youtube, color: "text-red-500", bgColor: "bg-red-500/10", urlPrefix: "https://youtube.com/@" },
  linkedin: { icon: Linkedin, color: "text-blue-700", bgColor: "bg-blue-700/10", urlPrefix: "https://linkedin.com/in/" },
  tiktok: { icon: Music2, color: "text-foreground", bgColor: "bg-foreground/10", urlPrefix: "https://tiktok.com/@" },
};

const SocialMedia = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);

  const [formData, setFormData] = useState({
    platform: "instagram",
    handle: "",
    email: "",
    recovery_email: "",
    recovery_phone: "",
    two_factor_enabled: false,
    notes: "",
    follower_count: "",
    verified: false,
  });

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("social_media_accounts")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching social accounts:", error);
      toast({ title: "Error loading accounts", variant: "destructive" });
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      platform: "instagram",
      handle: "",
      email: "",
      recovery_email: "",
      recovery_phone: "",
      two_factor_enabled: false,
      notes: "",
      follower_count: "",
      verified: false,
    });
  };

  const handleAdd = async () => {
    if (!formData.handle || !user) {
      toast({ title: "Handle required", description: "Please enter the account handle/username.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("social_media_accounts").insert({
      user_id: user.id,
      platform: formData.platform,
      handle: formData.handle,
      email: formData.email || null,
      recovery_email: formData.recovery_email || null,
      recovery_phone: formData.recovery_phone || null,
      two_factor_enabled: formData.two_factor_enabled,
      notes: formData.notes || null,
      follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
      verified: formData.verified,
      account_status: "active",
    });
    setSaving(false);

    if (error) {
      console.error("Error adding account:", error);
      toast({ title: "Error adding account", variant: "destructive" });
      return;
    }

    resetForm();
    setIsAddOpen(false);
    await fetchAccounts();
    toast({ title: "Account added", description: `${formData.platform} account has been added.` });
  };

  const handleEdit = (account: SocialAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      handle: account.handle,
      email: account.email || "",
      recovery_email: account.recovery_email || "",
      recovery_phone: account.recovery_phone || "",
      two_factor_enabled: account.two_factor_enabled,
      notes: account.notes || "",
      follower_count: account.follower_count?.toString() || "",
      verified: account.verified,
    });
  };

  const handleUpdate = async () => {
    if (!editingAccount) return;

    setSaving(true);
    const { error } = await supabase
      .from("social_media_accounts")
      .update({
        platform: formData.platform,
        handle: formData.handle,
        email: formData.email || null,
        recovery_email: formData.recovery_email || null,
        recovery_phone: formData.recovery_phone || null,
        two_factor_enabled: formData.two_factor_enabled,
        notes: formData.notes || null,
        follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
        verified: formData.verified,
      })
      .eq("id", editingAccount.id);
    setSaving(false);

    if (error) {
      console.error("Error updating account:", error);
      toast({ title: "Error updating account", variant: "destructive" });
      return;
    }

    setEditingAccount(null);
    resetForm();
    await fetchAccounts();
    toast({ title: "Account updated", description: "Social media account has been updated." });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("social_media_accounts").delete().eq("id", id);
    if (error) {
      console.error("Error deleting account:", error);
      toast({ title: "Error deleting account", variant: "destructive" });
      return;
    }
    await fetchAccounts();
    toast({ title: "Account removed", description: "Social media account has been removed." });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const filteredAccounts = accounts.filter(account =>
    account.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.follower_count || 0), 0);
  const verifiedCount = accounts.filter(acc => acc.verified).length;
  const twoFactorCount = accounts.filter(acc => acc.two_factor_enabled).length;

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const AccountFormDialog = ({ isOpen, onOpenChange, isEdit = false }: { 
    isOpen: boolean; 
    onOpenChange: (open: boolean) => void;
    isEdit?: boolean;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Social Media Account</DialogTitle>
          <DialogDescription>
            Store your social media login credentials securely.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={formData.platform} onValueChange={(v) => setFormData({...formData, platform: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-4 h-4", config.color)} />
                          <span className="capitalize">{key}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Handle/Username</Label>
              <Input placeholder="@username" value={formData.handle} onChange={(e) => setFormData({...formData, handle: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="Account email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recovery Email</Label>
              <Input type="email" placeholder="Recovery email" value={formData.recovery_email} onChange={(e) => setFormData({...formData, recovery_email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Recovery Phone</Label>
              <Input type="tel" placeholder="+27..." value={formData.recovery_phone} onChange={(e) => setFormData({...formData, recovery_phone: e.target.value})} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Is 2FA enabled on this account?</p>
              </div>
            </div>
            <Switch checked={formData.two_factor_enabled} onCheckedChange={(checked) => setFormData({...formData, two_factor_enabled: checked})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Follower Count</Label>
              <Input type="number" placeholder="0" value={formData.follower_count} onChange={(e) => setFormData({...formData, follower_count: e.target.value})} />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center gap-2 h-10">
                <Switch checked={formData.verified} onCheckedChange={(checked) => setFormData({...formData, verified: checked})} />
                <Label className="text-sm">Verified Account</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Any additional notes..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); setEditingAccount(null); }}>Cancel</Button>
          <Button variant="gold" onClick={isEdit ? handleUpdate : handleAdd} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isEdit ? "Update" : "Add"} Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <DashboardLayout title="My Social Media Links" subtitle="Securely manage your social media accounts and login credentials">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="My Social Media Links" 
      subtitle="Securely manage your social media accounts and login credentials"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatFollowers(totalFollowers)}</p>
                <p className="text-sm text-muted-foreground">Total Followers</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Instagram className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
                <p className="text-sm text-muted-foreground">Accounts</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{twoFactorCount}</p>
                <p className="text-sm text-muted-foreground">2FA Enabled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="text" placeholder="Search accounts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Button variant="gold" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        {/* Accounts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-card rounded-2xl border border-border">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground mb-1">No social media accounts yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add your social media accounts to keep track of credentials.
              </p>
              <Button variant="gold" onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Account
              </Button>
            </div>
          ) : (
            filteredAccounts.map((account) => {
              const config = platformConfig[account.platform] || platformConfig.instagram;
              const Icon = config.icon;

              return (
                <div key={account.id} className="bg-card rounded-2xl border border-border p-6 shadow-soft hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bgColor)}>
                        <Icon className={cn("w-6 h-6", config.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground capitalize">{account.platform}</p>
                          {account.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(account)}>
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(account.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {account.follower_count && (
                    <div className="mb-4 p-3 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Followers</span>
                        <span className="font-semibold text-foreground">{formatFollowers(account.follower_count)}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {account.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground truncate max-w-[150px]">{account.email}</span>
                          <button onClick={() => copyToClipboard(account.email!, "Email")} className="p-1 hover:bg-secondary rounded">
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Shield className={cn("w-4 h-4", account.two_factor_enabled ? "text-green-500" : "text-muted-foreground")} />
                        <span className="text-sm text-muted-foreground">
                          2FA {account.two_factor_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <a href={`${config.urlPrefix}${account.handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-secondary rounded">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>

                  {account.notes && (
                    <div className="mt-4 p-3 bg-gold/10 rounded-lg border border-gold/30">
                      <p className="text-xs text-muted-foreground">{account.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Security Info */}
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Security Notice</h4>
              <p className="text-sm text-muted-foreground">
                We recommend enabling two-factor authentication on all accounts. 
                Use a dedicated password manager (e.g. 1Password, Bitwarden) to store your login credentials securely — 
                never store passwords in spreadsheets or notes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AccountFormDialog isOpen={isAddOpen} onOpenChange={setIsAddOpen} />
      <AccountFormDialog isOpen={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)} isEdit />
    </DashboardLayout>
  );
};

export default SocialMedia;
