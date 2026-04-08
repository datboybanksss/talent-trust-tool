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
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  Users,
  ExternalLink,
  Music2
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
import { Switch } from "@/components/ui/switch";

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  email?: string;
  recoveryEmail?: string;
  recoveryPhone?: string;
  twoFactorEnabled: boolean;
  notes?: string;
  followerCount?: number;
  verified: boolean;
  accountStatus: "active" | "inactive" | "suspended";
}

const platformConfig: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  urlPrefix: string;
}> = {
  instagram: { 
    icon: Instagram, 
    color: "text-pink-500", 
    bgColor: "bg-pink-500/10",
    urlPrefix: "https://instagram.com/"
  },
  twitter: { 
    icon: Twitter, 
    color: "text-sky-500", 
    bgColor: "bg-sky-500/10",
    urlPrefix: "https://x.com/"
  },
  facebook: { 
    icon: Facebook, 
    color: "text-blue-600", 
    bgColor: "bg-blue-600/10",
    urlPrefix: "https://facebook.com/"
  },
  youtube: { 
    icon: Youtube, 
    color: "text-red-500", 
    bgColor: "bg-red-500/10",
    urlPrefix: "https://youtube.com/@"
  },
  linkedin: { 
    icon: Linkedin, 
    color: "text-blue-700", 
    bgColor: "bg-blue-700/10",
    urlPrefix: "https://linkedin.com/in/"
  },
  tiktok: { 
    icon: Music2, 
    color: "text-foreground", 
    bgColor: "bg-foreground/10",
    urlPrefix: "https://tiktok.com/@"
  },
};

const SocialMedia = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    platform: "instagram",
    handle: "",
    email: "",
    recoveryEmail: "",
    recoveryPhone: "",
    twoFactorEnabled: false,
    notes: "",
    followerCount: "",
    verified: false,
  });

  // Mock data - will be replaced with real data from Supabase
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: "1",
      platform: "instagram",
      handle: "@johndoe_rugby",
      email: "john@email.com",
      twoFactorEnabled: true,
      followerCount: 125000,
      verified: true,
      accountStatus: "active",
      notes: "Main personal brand account",
    },
    {
      id: "2",
      platform: "twitter",
      handle: "@JohnDoeRugby",
      email: "john@email.com",
      twoFactorEnabled: true,
      followerCount: 85000,
      verified: true,
      accountStatus: "active",
    },
    {
      id: "3",
      platform: "youtube",
      handle: "JohnDoeOfficial",
      email: "johndoe.youtube@email.com",
      recoveryEmail: "backup@email.com",
      twoFactorEnabled: true,
      followerCount: 50000,
      verified: false,
      accountStatus: "active",
      notes: "Training and lifestyle content",
    },
    {
      id: "4",
      platform: "linkedin",
      handle: "johndoe-rugby",
      email: "john.professional@email.com",
      twoFactorEnabled: false,
      followerCount: 15000,
      verified: false,
      accountStatus: "active",
    },
    {
      id: "5",
      platform: "tiktok",
      handle: "@johndoe.rugby",
      email: "john@email.com",
      twoFactorEnabled: true,
      followerCount: 250000,
      verified: true,
      accountStatus: "active",
      notes: "Short-form content, highest engagement",
    },
  ]);

  const resetForm = () => {
    setFormData({
      platform: "instagram",
      handle: "",
      email: "",
      password: "",
      recoveryEmail: "",
      recoveryPhone: "",
      twoFactorEnabled: false,
      twoFactorBackupCodes: "",
      notes: "",
      followerCount: "",
      verified: false,
    });
  };

  const handleAdd = () => {
    if (!formData.handle) {
      toast({
        title: "Handle required",
        description: "Please enter the account handle/username.",
        variant: "destructive",
      });
      return;
    }

    const newAccount: SocialAccount = {
      id: Date.now().toString(),
      platform: formData.platform,
      handle: formData.handle,
      email: formData.email || undefined,
      password: formData.password || undefined,
      recoveryEmail: formData.recoveryEmail || undefined,
      recoveryPhone: formData.recoveryPhone || undefined,
      twoFactorEnabled: formData.twoFactorEnabled,
      twoFactorBackupCodes: formData.twoFactorBackupCodes || undefined,
      notes: formData.notes || undefined,
      followerCount: formData.followerCount ? parseInt(formData.followerCount) : undefined,
      verified: formData.verified,
      accountStatus: "active",
    };

    setAccounts([...accounts, newAccount]);
    resetForm();
    setIsAddOpen(false);

    toast({
      title: "Account added",
      description: `${formData.platform} account has been added.`,
    });
  };

  const handleEdit = (account: SocialAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      handle: account.handle,
      email: account.email || "",
      password: account.password || "",
      recoveryEmail: account.recoveryEmail || "",
      recoveryPhone: account.recoveryPhone || "",
      twoFactorEnabled: account.twoFactorEnabled,
      twoFactorBackupCodes: account.twoFactorBackupCodes || "",
      notes: account.notes || "",
      followerCount: account.followerCount?.toString() || "",
      verified: account.verified,
    });
  };

  const handleUpdate = () => {
    if (!editingAccount) return;

    setAccounts(accounts.map(acc => 
      acc.id === editingAccount.id
        ? {
            ...acc,
            platform: formData.platform,
            handle: formData.handle,
            email: formData.email || undefined,
            password: formData.password || undefined,
            recoveryEmail: formData.recoveryEmail || undefined,
            recoveryPhone: formData.recoveryPhone || undefined,
            twoFactorEnabled: formData.twoFactorEnabled,
            twoFactorBackupCodes: formData.twoFactorBackupCodes || undefined,
            notes: formData.notes || undefined,
            followerCount: formData.followerCount ? parseInt(formData.followerCount) : undefined,
            verified: formData.verified,
          }
        : acc
    ));

    setEditingAccount(null);
    resetForm();

    toast({
      title: "Account updated",
      description: "Social media account has been updated.",
    });
  };

  const handleDelete = (id: string) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
    toast({
      title: "Account removed",
      description: "Social media account has been removed.",
    });
  };

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const filteredAccounts = accounts.filter(account =>
    account.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.followerCount || 0), 0);
  const verifiedCount = accounts.filter(acc => acc.verified).length;
  const twoFactorCount = accounts.filter(acc => acc.twoFactorEnabled).length;

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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Input
                placeholder="@username"
                value={formData.handle}
                onChange={(e) => setFormData({...formData, handle: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Account email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Account password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recovery Email</Label>
              <Input
                type="email"
                placeholder="Recovery email"
                value={formData.recoveryEmail}
                onChange={(e) => setFormData({...formData, recoveryEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Recovery Phone</Label>
              <Input
                type="tel"
                placeholder="+27..."
                value={formData.recoveryPhone}
                onChange={(e) => setFormData({...formData, recoveryPhone: e.target.value})}
              />
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
            <Switch
              checked={formData.twoFactorEnabled}
              onCheckedChange={(checked) => setFormData({...formData, twoFactorEnabled: checked})}
            />
          </div>

          {formData.twoFactorEnabled && (
            <div className="space-y-2">
              <Label>2FA Backup Codes</Label>
              <Textarea
                placeholder="Enter backup codes (comma separated)"
                value={formData.twoFactorBackupCodes}
                onChange={(e) => setFormData({...formData, twoFactorBackupCodes: e.target.value})}
                rows={2}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Follower Count</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.followerCount}
                onChange={(e) => setFormData({...formData, followerCount: e.target.value})}
              />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({...formData, verified: checked})}
                />
                <Label className="text-sm">Verified Account</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
            resetForm();
            setEditingAccount(null);
          }}>
            Cancel
          </Button>
          <Button variant="gold" onClick={isEdit ? handleUpdate : handleAdd}>
            {isEdit ? "Update" : "Add"} Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
            <Input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
              const isPasswordVisible = visiblePasswords.has(account.id);

              return (
                <div
                  key={account.id}
                  className="bg-card rounded-2xl border border-border p-6 shadow-soft hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bgColor)}>
                        <Icon className={cn("w-6 h-6", config.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground capitalize">{account.platform}</p>
                          {account.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(account)}>
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  {account.followerCount && (
                    <div className="mb-4 p-3 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Followers</span>
                        <span className="font-semibold text-foreground">{formatFollowers(account.followerCount)}</span>
                      </div>
                    </div>
                  )}

                  {/* Credentials */}
                  <div className="space-y-3">
                    {account.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground truncate max-w-[150px]">{account.email}</span>
                          <button 
                            onClick={() => copyToClipboard(account.email!, "Email")}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}

                    {account.password && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Password</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground font-mono">
                            {isPasswordVisible ? account.password : "••••••••"}
                          </span>
                          <button 
                            onClick={() => togglePasswordVisibility(account.id)}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Eye className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(account.password!, "Password")}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Security Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Shield className={cn("w-4 h-4", account.twoFactorEnabled ? "text-green-500" : "text-muted-foreground")} />
                        <span className="text-sm text-muted-foreground">
                          2FA {account.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <a
                        href={`${config.urlPrefix}${account.handle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>

                  {/* Notes */}
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
                Your credentials are stored securely and protected by row-level security. 
                We recommend enabling two-factor authentication on all accounts and using unique passwords. 
                Consider using a dedicated password manager for additional security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <AccountFormDialog isOpen={isAddOpen} onOpenChange={setIsAddOpen} />

      {/* Edit Dialog */}
      <AccountFormDialog isOpen={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)} isEdit />
    </DashboardLayout>
  );
};

export default SocialMedia;
