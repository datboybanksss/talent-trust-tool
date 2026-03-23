import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield, Users, Megaphone, Search, Plus, Trash2, Eye,
  ArrowLeft, UserCheck, Clock, AlertTriangle, Info, CheckCircle2, Crown
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  client_type: string | null;
  phone: string | null;
  created_at: string;
}

interface Announcement {
  id: string;
  admin_id: string;
  title: string;
  message: string;
  priority: string;
  is_active: boolean;
  created_at: string;
}

const priorityConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  info: { icon: <Info className="w-3.5 h-3.5" />, color: "bg-blue-500/10 text-blue-600 border-blue-200", label: "Info" },
  warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", label: "Warning" },
  critical: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "bg-destructive/10 text-destructive border-destructive/20", label: "Critical" },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Announcement form
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [aTitle, setATitle] = useState("");
  const [aMessage, setAMessage] = useState("");
  const [aPriority, setAPriority] = useState("info");

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
    setLoadingUsers(false);
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from("system_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data as Announcement[]);
    setLoadingAnnouncements(false);
  }, []);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/auth");
      return;
    }
    if (isAdmin) {
      fetchUsers();
      fetchAnnouncements();
    }
  }, [isAdmin, roleLoading, navigate, fetchUsers, fetchAnnouncements]);

  const handleCreateAnnouncement = async () => {
    if (!aTitle || !aMessage || !user) return;
    const { error } = await supabase.from("system_announcements").insert({
      admin_id: user.id,
      title: aTitle,
      message: aMessage,
      priority: aPriority,
    } as any);
    if (error) {
      toast({ title: "Error", description: "Could not create announcement.", variant: "destructive" });
      return;
    }
    toast({ title: "Announcement published", description: "All users will see this announcement." });
    setATitle("");
    setAMessage("");
    setAPriority("info");
    setAnnouncementOpen(false);
    fetchAnnouncements();
  };

  const handleToggleAnnouncement = async (id: string, currentActive: boolean) => {
    await supabase.from("system_announcements").update({ is_active: !currentActive } as any).eq("id", id);
    fetchAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await supabase.from("system_announcements").delete().eq("id", id);
    fetchAnnouncements();
    toast({ title: "Announcement deleted" });
  };

  const filteredUsers = users.filter(u =>
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.client_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Checking access...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-gold">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">LegacyBuilder Support Centre</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/executive-overview">
              <Crown className="w-4 h-4" />
              Executive Overview
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.client_type).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Profiles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {announcements.filter(a => a.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Announcements</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">System Announcements</CardTitle>
              <CardDescription>Broadcast messages to all platform users</CardDescription>
            </div>
            <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button variant="gold" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>This will be visible to all logged-in users.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="e.g. Scheduled maintenance" value={aTitle} onChange={e => setATitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea placeholder="Write your announcement..." value={aMessage} onChange={e => setAMessage(e.target.value)} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={aPriority} onValueChange={setAPriority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
                  <Button variant="gold" onClick={handleCreateAnnouncement} disabled={!aTitle || !aMessage}>
                    Publish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingAnnouncements ? (
              <p className="text-center text-muted-foreground py-6 animate-pulse">Loading...</p>
            ) : announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => {
                  const pc = priorityConfig[a.priority] || priorityConfig.info;
                  return (
                    <div key={a.id} className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${a.is_active ? "bg-card" : "bg-muted/30 opacity-60"}`}>
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Badge variant="outline" className={`${pc.color} text-xs shrink-0`}>
                          {pc.icon}
                          <span className="ml-1">{pc.label}</span>
                        </Badge>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm">{a.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(a.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleAnnouncement(a.id, a.is_active)}
                          title={a.is_active ? "Deactivate" : "Activate"}
                        >
                          {a.is_active ? <Eye className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteAnnouncement(a.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">All Users</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
              </div>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <p className="text-center text-muted-foreground py-8 animate-pulse">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(u => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                                {u.display_name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{u.display_name || "Unnamed"}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{u.user_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {u.client_type || "Not set"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {u.phone || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
