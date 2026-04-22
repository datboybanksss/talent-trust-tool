import { useState, useEffect, useCallback, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, UserPlus, Copy, CheckCircle2, Clock, Mail, LogOut, Shield,
  Users, TrendingUp, FileText, Calendar, ArrowUpRight, BarChart3, Eye,
  Upload, X, Paperclip, Kanban, List, Plus, Trash2, FileSpreadsheet, AlertCircle,
  Handshake, Download, Menu, User
} from "lucide-react";
import CurrentTierBadge from "@/components/subscription/CurrentTierBadge";
import DealPipeline from "@/components/dashboard/DealPipeline";
import ClientComparison from "@/components/dashboard/ClientComparison";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentNotifications from "@/components/agent/AgentNotifications";
import AgentCalendar from "@/components/agent/AgentCalendar";
import AgreementTemplates from "@/components/agent/AgreementTemplates";
import SharePortal from "@/components/agent/SharePortal";
import AgentChatBot from "@/components/agent/AgentChatBot";
import ConfidentialityGate from "@/components/agent/ConfidentialityGate";
import ExecutiveOverviewInline from "@/components/executive/ExecutiveOverviewInline";
import RemoveClientDialog from "@/components/agent/RemoveClientDialog";
import * as XLSX from "xlsx";
import SectionGuard from "@/components/agent/SectionGuard";
import { useStaffAccess } from "@/hooks/useStaffAccess";

interface Invitation {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_type: string;
  status: string;
  invitation_token: string;
  created_at: string;
  activated_user_id?: string | null;
}

// Helper: humanize a timestamp into "2h ago", "3d ago", etc.
const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const AgentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const staff = useStaffAccess();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState<{ role: string; company_name: string } | null>({
    role: "athlete_agent",
    company_name: "Roc Nation Sports SA",
  });
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<"clients" | "pipeline" | "compare" | "calendar" | "templates" | "share" | "executive">("executive");

  // When staff finishes loading, default their view to the first allowed section
  useEffect(() => {
    if (staff.loading || !staff.isStaff) return;
    const order: Array<typeof activeView> = ["clients", "pipeline", "compare", "calendar", "templates"];
    const first = order.find((v) => staff.sections.includes(v));
    if (first && (activeView === "executive" || activeView === "share" || !staff.sections.includes(activeView))) {
      setActiveView(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff.loading, staff.isStaff, staff.sections.join("|")]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<{ name: string; email: string; phone: string; type: string; sport: string; team: string; marketValue: string; valid: boolean; error?: string }[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // Remove-from-roster dialog state
  const [removeTarget, setRemoveTarget] = useState<Invitation | null>(null);

  // Staff confidentiality gate state
  const [staffAccess, setStaffAccess] = useState<{
    id: string;
    agent_company: string;
    role_label: string;
    sections: string[];
    confidentiality_accepted_at: string | null;
  } | null>(null);
  const [staffCheckDone, setStaffCheckDone] = useState(false);

  // Check if current user is a staff member who needs to accept confidentiality
  useEffect(() => {
    const checkStaffAccess = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("portal_staff_access")
        .select("id, role_label, sections, confidentiality_accepted_at, agent_id")
        .eq("staff_user_id", user.id)
        .maybeSingle();

      if (data && !data.confidentiality_accepted_at) {
        // Also try to get agent company name
        const { data: agentData } = await supabase
          .from("agent_manager_profiles")
          .select("company_name")
          .eq("user_id", data.agent_id)
          .maybeSingle();

        setStaffAccess({
          id: data.id,
          agent_company: agentData?.company_name || "Agent Portal",
          role_label: data.role_label,
          sections: (data.sections as string[]) || [],
          confidentiality_accepted_at: data.confidentiality_accepted_at,
        });
      }
      setStaffCheckDone(true);
    };
    checkStaffAccess();
  }, [user]);

  const triggerBulkImport = () => {
    bulkInputRef.current?.click();
  };

  // Form state — basic
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientType, setClientType] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form state — extended profile
  const [teamOrAgency, setTeamOrAgency] = useState("");
  const [sportOrDiscipline, setSportOrDiscipline] = useState("");
  const [engagementType, setEngagementType] = useState("");
  const [location, setLocation] = useState("");
  const [nationality, setNationality] = useState("South African");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  // Form state — deals
  interface PreDeal {
    brand: string;
    type: string;
    value: string;
    startDate: string;
    endDate: string;
    status: string;
  }
  const [preDeals, setPreDeals] = useState<PreDeal[]>([]);

  // Form state — spreadsheet import
  const [importedData, setImportedData] = useState<Record<string, string> | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [formTab, setFormTab] = useState("basic");

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
    if (!user) return;
    const { data } = await supabase
      .from("client_invitations")
      .select("*")
      .eq("agent_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    setInvitations(data ?? []);
  };

  const handleSpreadsheetImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (rows.length === 0) {
          setImportErrors(["Spreadsheet is empty."]);
          return;
        }
        const row = rows[0]; // first row = client data
        const keyMap: Record<string, string> = {};
        Object.keys(row).forEach((k) => { keyMap[k.toLowerCase().trim()] = row[k]; });

        // Auto-map fields
        if (keyMap["name"] || keyMap["client name"] || keyMap["full name"]) setClientName(keyMap["name"] || keyMap["client name"] || keyMap["full name"]);
        if (keyMap["email"] || keyMap["client email"]) setClientEmail(keyMap["email"] || keyMap["client email"]);
        if (keyMap["phone"] || keyMap["client phone"]) setClientPhone(keyMap["phone"] || keyMap["client phone"]);
        if (keyMap["type"] || keyMap["client type"]) setClientType((keyMap["type"] || keyMap["client type"]).toLowerCase());
        if (keyMap["team"] || keyMap["agency"]) setTeamOrAgency(keyMap["team"] || keyMap["agency"]);
        if (keyMap["sport"] || keyMap["discipline"]) setSportOrDiscipline(keyMap["sport"] || keyMap["discipline"]);
        if (keyMap["engagement type"] || keyMap["engagement"]) setEngagementType(keyMap["engagement type"] || keyMap["engagement"]);
        if (keyMap["location"] || keyMap["city"]) setLocation(keyMap["location"] || keyMap["city"]);
        if (keyMap["nationality"]) setNationality(keyMap["nationality"]);
        if (keyMap["date of birth"] || keyMap["dob"]) setDateOfBirth(keyMap["date of birth"] || keyMap["dob"]);
        if (keyMap["id number"] || keyMap["id"]) setIdNumber(keyMap["id number"] || keyMap["id"]);
        if (keyMap["social"] || keyMap["social handle"] || keyMap["instagram"]) setSocialHandle(keyMap["social"] || keyMap["social handle"] || keyMap["instagram"]);
        if (keyMap["notes"]) setNotes(keyMap["notes"]);

        // Import deals if multiple rows
        if (rows.length > 1) {
          const dealKeys = Object.keys(rows[1]).map((k) => k.toLowerCase().trim());
          const hasDealCols = dealKeys.some((k) => ["brand", "deal type", "deal value"].includes(k));
          if (hasDealCols) {
            const deals: PreDeal[] = rows.slice(1).filter((r) => {
              const dk: Record<string, string> = {};
              Object.keys(r).forEach((k) => { dk[k.toLowerCase().trim()] = r[k]; });
              return dk["brand"];
            }).map((r) => {
              const dk: Record<string, string> = {};
              Object.keys(r).forEach((k) => { dk[k.toLowerCase().trim()] = r[k]; });
              return {
                brand: dk["brand"] || "",
                type: dk["deal type"] || dk["type"] || "Endorsement",
                value: dk["deal value"] || dk["value"] || "",
                startDate: dk["start date"] || dk["start"] || "",
                endDate: dk["end date"] || dk["end"] || "",
                status: dk["status"] || "active",
              };
            });
            if (deals.length > 0) setPreDeals(deals);
          }
        }

        setImportedData(keyMap);
        setImportErrors([]);
        toast({ title: "Import Successful", description: `Loaded client data from ${file.name}.` });
      } catch {
        setImportErrors(["Could not parse the file. Please use .xlsx or .csv format."]);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }, [toast]);

  const addDeal = () => {
    setPreDeals((prev) => [...prev, { brand: "", type: "Endorsement", value: "", startDate: "", endDate: "", status: "active" }]);
  };

  const updateDeal = (index: number, field: keyof PreDeal, value: string) => {
    setPreDeals((prev) => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const removeDeal = (index: number) => {
    setPreDeals((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setClientName(""); setClientEmail(""); setClientPhone(""); setClientType(""); setNotes("");
    setUploadedFiles([]); setTeamOrAgency(""); setSportOrDiscipline(""); setEngagementType("");
    setLocation(""); setNationality("South African"); setDateOfBirth(""); setIdNumber("");
    setSocialHandle(""); setPreDeals([]); setImportedData(null); setImportErrors([]);
    setFormTab("basic");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 20 * 1024 * 1024;
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
      const { data: inserted, error } = await supabase.from("client_invitations").insert({
        agent_id: user.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || null,
        client_type: clientType,
        pre_populated_data: JSON.parse(JSON.stringify({
          notes,
          documents: documentsMeta,
          profile: {
            team_or_agency: teamOrAgency,
            sport_or_discipline: sportOrDiscipline,
            engagement_type: engagementType,
            location,
            nationality,
            date_of_birth: dateOfBirth,
            id_number: idNumber,
            social_handle: socialHandle,
          },
          deals: preDeals,
        })),
      }).select("id, invitation_token, client_name").single();

      if (error) {
        toast({ title: "Error", description: "Failed to create invitation.", variant: "destructive" });
        setIsCreating(false);
        return;
      }

      // Auto-copy the real activation link as a fallback in case email delivery fails.
      if (inserted?.invitation_token) {
        const url = `${window.location.origin}/client-activate/${inserted.invitation_token}`;
        try { await navigator.clipboard.writeText(url); } catch { /* clipboard may be unavailable */ }
      }

      // Fire the invitation email
      if (inserted?.id) {
        const { data: emailRes, error: emailErr } = await supabase.functions.invoke("send-invitation-email", {
          body: {
            invitation_type: "client",
            invitation_id: inserted.id,
            app_origin: window.location.origin,
          },
        });
        if (emailErr || (emailRes && !emailRes.success)) {
          toast({
            title: "Invitation saved — email failed",
            description: `Invitation for ${inserted.client_name} is saved and the activation link is on your clipboard. Send it manually.`,
            variant: "destructive",
          });
        } else if (emailRes?.demo) {
          toast({ title: "Demo mode", description: "Invitation saved. No real email sent (demo account)." });
        } else {
          toast({
            title: "Invitation emailed",
            description: `Activation link emailed to ${inserted.client_name}. Backup link copied to clipboard.`,
          });
        }
      }
    }

    setIsCreating(false);
    resetForm();
    setDialogOpen(false);
    fetchInvitations();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/client-activate/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Activation link copied to clipboard." });
  };

  const resendInvitation = async (inv: Invitation) => {
    // Refresh expiry if the invitation is past due
    const { data: row } = await supabase
      .from("client_invitations")
      .select("expires_at")
      .eq("id", inv.id)
      .maybeSingle();
    if (row?.expires_at && new Date(row.expires_at) <= new Date()) {
      const newExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("client_invitations").update({ expires_at: newExpiry }).eq("id", inv.id);
    }
    const { data: emailRes, error: emailErr } = await supabase.functions.invoke("send-invitation-email", {
      body: { invitation_type: "client", invitation_id: inv.id, app_origin: window.location.origin },
    });
    if (emailErr || (emailRes && !emailRes.success)) {
      toast({ title: "Resend failed", description: emailRes?.error ?? "Email delivery failed.", variant: "destructive" });
    } else if (emailRes?.demo) {
      toast({ title: "Demo mode", description: "Email not actually sent (demo account)." });
    } else {
      toast({ title: "Invitation resent", description: `Fresh invitation emailed to ${inv.client_name}.` });
      if (user) {
        await supabase.from("audit_log").insert({
          action: "invitation_resent",
          entity_type: "invitation",
          entity_id: inv.id,
          user_id: user.id,
          metadata: { invitation_type: "client", recipient: inv.client_email },
        });
      }
    }
    fetchInvitations();
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Name", "Email", "Phone", "Type", "Sport", "Team", "Market Value", "Location", "Nationality", "Date of Birth", "ID Number", "Social", "Notes"],
      ["John Doe", "john@example.com", "+27 81 000 0000", "athlete", "Soccer", "Orlando Pirates", "R10,000,000", "Johannesburg, SA", "South African", "1995-06-15", "9506155000000", "@johndoe", "Sample client"],
      ["", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["Brand", "Deal Type", "Deal Value", "Start Date", "End Date", "Status", "", "", "", "", "", "", ""],
      ["Nike", "Endorsement", "R2,000,000/yr", "2025-01-01", "2026-12-31", "active", "", "", "", "", "", "", ""],
      ["Adidas", "Sponsorship", "R1,500,000", "2025-06-01", "2026-05-31", "negotiating", "", "", "", "", "", "", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Client Data");
    XLSX.writeFile(wb, "LegacyBuilder_Client_Template.xlsx");
  };

  const downloadBulkTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Name", "Email", "Phone", "Type", "Sport/Discipline", "Team/Agency", "Market Value", "Location", "Nationality"],
      ["Siya Kolisi", "siya@example.com", "+27 81 234 5678", "athlete", "Rugby", "Springboks", "R45,000,000", "Cape Town", "South African"],
      ["Tyla Seethal", "tyla@example.com", "+27 84 567 8901", "artist", "Recording Artist", "Epic Records", "R85,000,000", "Johannesburg", "South African"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "LegacyBuilder_Bulk_Import_Template.xlsx");
  };

  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (rows.length === 0) {
          toast({ title: "Empty File", description: "The spreadsheet has no data rows.", variant: "destructive" });
          return;
        }

        const parsed = rows.map((row) => {
          const k: Record<string, string> = {};
          Object.keys(row).forEach((key) => { k[key.toLowerCase().trim()] = String(row[key]).trim(); });
          const name = k["name"] || k["client name"] || k["full name"] || "";
          const email = k["email"] || k["client email"] || "";
          const phone = k["phone"] || k["client phone"] || "";
          const type = (k["type"] || k["client type"] || "athlete").toLowerCase();
          const sport = k["sport"] || k["discipline"] || k["sport/discipline"] || "";
          const team = k["team"] || k["agency"] || k["team/agency"] || "";
          const marketValue = k["market value"] || k["value"] || "";

          let valid = true;
          let error: string | undefined;
          if (!name) { valid = false; error = "Missing name"; }
          else if (!email) { valid = false; error = "Missing email"; }
          else if (!email.includes("@")) { valid = false; error = "Invalid email"; }
          else if (!["athlete", "artist"].includes(type)) { valid = false; error = "Type must be athlete or artist"; }

          return { name, email, phone, type, sport, team, marketValue, valid, error };
        });

        setBulkPreview(parsed);
        setBulkDialogOpen(true);
        toast({ title: "File Loaded", description: `${parsed.length} client${parsed.length > 1 ? "s" : ""} found. Review before importing.` });
      } catch {
        toast({ title: "Parse Error", description: "Could not read the file. Use .xlsx or .csv format.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleBulkImport = async () => {
    const validClients = bulkPreview.filter((c) => c.valid);
    if (validClients.length === 0) return;
    setBulkImporting(true);
    setBulkProgress(0);

    let successCount = 0;
    for (let i = 0; i < validClients.length; i++) {
      const c = validClients[i];
      if (user) {
        const { error } = await supabase.from("client_invitations").insert({
          agent_id: user.id,
          client_name: c.name,
          client_email: c.email,
          client_phone: c.phone || null,
          client_type: c.type,
          pre_populated_data: JSON.parse(JSON.stringify({
            profile: { sport_or_discipline: c.sport, team_or_agency: c.team, market_value: c.marketValue },
          })),
        });
        if (!error) successCount++;
      }

      // Also add to local state
      const newInv: Invitation = {
        id: `bulk_${Date.now()}_${i}`,
        client_name: c.name,
        client_email: c.email,
        client_phone: c.phone || null,
        client_type: c.type,
        status: "pending",
        invitation_token: `tok_bulk_${Date.now()}_${i}`,
        created_at: new Date().toISOString(),
      };
      setInvitations((prev) => [newInv, ...prev]);
      setBulkProgress(Math.round(((i + 1) / validClients.length) * 100));
    }

    setBulkImporting(false);
    setBulkDialogOpen(false);
    setBulkPreview([]);
    toast({ title: "Bulk Import Complete", description: `${successCount} of ${validClients.length} clients imported successfully.` });
    fetchInvitations();
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

  // Show confidentiality gate for staff who haven't accepted
  if (staffCheckDone && staffAccess && !staffAccess.confidentiality_accepted_at) {
    return (
      <ConfidentialityGate
        staffAccessId={staffAccess.id}
        agentCompany={staffAccess.agent_company}
        roleName={staffAccess.role_label}
        sections={staffAccess.sections}
        onAccepted={() => setStaffAccess(null)}
      />
    );
  }

  const roleLabel = agentProfile?.role === "athlete_agent" ? "Athletes' Agent" : "Artists' Manager";
  const activatedCount = invitations.filter((i) => i.status === "activated").length;
  const pendingCount = invitations.filter((i) => i.status === "pending").length;
  // Derive recent activity from real invitations (most recent 5 events).
  const recentActivity = invitations
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((i) => ({
      action: i.status === "activated" ? "Profile activated" : "Invitation sent",
      client: i.client_name,
      time: timeAgo(i.created_at),
      icon: i.status === "activated" ? CheckCircle2 : Mail,
    }));
  const rawName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";
  const firstName = rawName.trim().split(/\s+/)[0] || "Agent";
  const displayFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const possessive = displayFirstName.endsWith("s") ? `${displayFirstName}'` : `${displayFirstName}'s`;
  const portalTitle = `${possessive} Portal`;
  const activationRate = invitations.length > 0 ? Math.round((activatedCount / invitations.length) * 100) : 0;

  return (
    <>
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AgentSidebar
          onNewClient={() => setDialogOpen(true)}
          onBulkImport={triggerBulkImport}
          agentProfile={agentProfile}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        {/* Hidden bulk import input */}
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkFileSelect} className="hidden" ref={bulkInputRef} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="mr-1" />
                <h1 className="text-lg font-display font-bold text-foreground">{portalTitle}</h1>
                <CurrentTierBadge tierType="agent" />
              </div>
              <AgentNotifications
                pendingCount={pendingCount}
                recentActivity={recentActivity}
              />
            </div>
          </header>

          <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
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

        {activeView === "executive" ? (
          <SectionGuard ownerOnly><ExecutiveOverviewInline /></SectionGuard>
        ) : activeView === "pipeline" ? (
          <SectionGuard section="pipeline"><DealPipeline /></SectionGuard>
        ) : activeView === "compare" ? (
          <SectionGuard section="compare"><ClientComparison /></SectionGuard>
        ) : activeView === "calendar" ? (
          <SectionGuard section="calendar"><AgentCalendar /></SectionGuard>
        ) : activeView === "templates" ? (
          <SectionGuard section="templates">
            <AgreementTemplates clients={invitations.filter(i => i.status === "activated").map(i => ({ id: i.id, name: i.client_name, email: i.client_email, phone: i.client_phone, type: i.client_type }))} />
          </SectionGuard>
        ) : activeView === "share" ? (
          <SectionGuard ownerOnly><SharePortal /></SectionGuard>
        ) : (
        <>
        {staff.isStaff && !staff.sections.includes("clients") ? (
          <SectionGuard section="clients"><div /></SectionGuard>
        ) : (
        <>
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Client List — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">Client Invitations</h2>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" /> New Client
              </Button>
            </div>


            <div className="space-y-3">
              {invitations.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">No clients yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You haven't invited any clients yet. Click <strong>New Client</strong> to send your first invitation.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : invitations.map((inv) => {
                const initials = inv.client_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                const isActivated = inv.status === "activated";
                const date = new Date(inv.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

                return (
                  <Card
                    key={inv.id}
                    className="hover:border-primary/30 transition-all duration-200 hover:shadow-sm cursor-pointer"
                    onClick={() => navigate(`/agent-dashboard/client/${inv.id}`)}
                  >
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
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); copyLink(inv.invitation_token); }} className="hidden sm:flex">
                            <Copy className="w-3 h-3 mr-1" /> Copy Link
                          </Button>
                        )}
                        {!isActivated && (
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); resendInvitation(inv); }} className="hidden sm:flex">
                            <Mail className="w-3 h-3 mr-1" /> Resend
                          </Button>
                        )}
                        {isActivated && (
                          <Button variant="ghost" size="sm" className="text-primary hidden sm:flex" onClick={(e) => { e.stopPropagation(); navigate(`/agent-dashboard/client/${inv.id}`); }}>
                            <Eye className="w-3 h-3 mr-1" /> View
                          </Button>
                        )}
                        {inv.client_type === "athlete" && (
                          <Button variant="outline" size="sm" className="text-primary border-primary/30 hidden sm:flex" onClick={(e) => { e.stopPropagation(); navigate(`/agent-dashboard/athlete/${inv.id}`); }}>
                            <User className="w-3 h-3 mr-1" /> Full Profile
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); setRemoveTarget(inv); }}
                          aria-label={`Remove ${inv.client_name} from roster`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                  {recentActivity.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No recent activity yet.</p>
                  ) : recentActivity.map((activity, i) => (
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
        </>
        )}

            {/* New Client dialog: kept here for now, but always mounted regardless of view */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Create Client Profile</DialogTitle>
                  <DialogDescription>
                    Pre-populate your client's profile with detailed information, deals, and documents. Import from a spreadsheet or fill in manually.
                  </DialogDescription>
                </DialogHeader>
                <div className="border border-dashed border-primary/40 bg-primary/5 rounded-lg p-3 flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Import from Spreadsheet</p>
                      <p className="text-[10px] text-muted-foreground">Upload .xlsx or .csv · <button onClick={downloadTemplate} className="underline text-primary hover:text-primary/80">Download template</button></p>
                    </div>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleSpreadsheetImport} className="hidden" id="spreadsheet-import" />
                    <label htmlFor="spreadsheet-import">
                      <Button variant="outline" size="sm" asChild><span><Upload className="w-3.5 h-3.5 mr-1" /> Import</span></Button>
                    </label>
                  </div>
                  {importErrors.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {importErrors[0]}
                    </div>
                  )}
                  {importedData && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-500/10 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Spreadsheet data imported — review and adjust below.
                    </div>
                  )}

                  <ScrollArea className="max-h-[55vh] pr-4">
                  <Tabs value={formTab} onValueChange={setFormTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
                      <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                      <TabsTrigger value="deals" className="text-xs">Deals ({preDeals.length})</TabsTrigger>
                      <TabsTrigger value="docs" className="text-xs">Documents</TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Client Name *</Label>
                          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Full name" />
                        </div>
                        <div>
                          <Label className="text-xs">Client Email *</Label>
                          <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@email.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Client Phone</Label>
                          <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+27..." />
                        </div>
                        <div>
                          <Label className="text-xs">Client Type *</Label>
                          <Select value={clientType || "athlete"} onValueChange={setClientType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="athlete">Athlete</SelectItem>
                              <SelectItem value="artist">Artist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Notes (visible to client)</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pre-populated notes..." rows={2} />
                      </div>
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{clientType === "artist" ? "Discipline" : "Sport"}</Label>
                          <Input value={sportOrDiscipline} onChange={(e) => setSportOrDiscipline(e.target.value)} placeholder={clientType === "artist" ? "e.g. Recording Artist" : "e.g. Rugby"} />
                        </div>
                        <div>
                          <Label className="text-xs">{clientType === "artist" ? "Agency / Label" : "Team / Club"}</Label>
                          <Input value={teamOrAgency} onChange={(e) => setTeamOrAgency(e.target.value)} placeholder={clientType === "artist" ? "e.g. Epic Records" : "e.g. Springboks"} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Engagement Type</Label>
                          <Select value={engagementType} onValueChange={setEngagementType}>
                            <SelectTrigger><SelectValue placeholder="Select engagement type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full Representation">Full Representation</SelectItem>
                              <SelectItem value="Commercial Rights Only">Commercial Rights Only</SelectItem>
                              <SelectItem value="Brand & Endorsements">Brand & Endorsements</SelectItem>
                              <SelectItem value="Contract Negotiation">Contract Negotiation</SelectItem>
                              <SelectItem value="Advisory / Consultation">Advisory / Consultation</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Location</Label>
                          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Cape Town, SA" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Nationality</Label>
                          <Input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. South African" />
                        </div>
                        <div>
                          <Label className="text-xs">Date of Birth</Label>
                          <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">ID / Passport Number</Label>
                          <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="National ID or passport" />
                        </div>
                        <div>
                          <Label className="text-xs">Primary Social Handle</Label>
                          <Input value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)} placeholder="@handle" />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Deals Tab */}
                    <TabsContent value="deals" className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Add existing contracts, endorsements, or partnerships.</p>
                        <Button variant="outline" size="sm" onClick={addDeal}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Deal
                        </Button>
                      </div>
                      {preDeals.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-border rounded-lg">
                          <Handshake className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No deals added yet</p>
                          <Button variant="ghost" size="sm" className="mt-2" onClick={addDeal}>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add First Deal
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {preDeals.map((deal, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-border/50 bg-secondary/20 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Deal {idx + 1}</span>
                                <button onClick={() => removeDeal(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Brand / Partner" value={deal.brand} onChange={(e) => updateDeal(idx, "brand", e.target.value)} className="h-8 text-xs" />
                                <Select value={deal.type} onValueChange={(v) => updateDeal(idx, "type", v)}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Endorsement">Endorsement</SelectItem>
                                    <SelectItem value="Player Contract">Player Contract</SelectItem>
                                    <SelectItem value="Recording Contract">Recording Contract</SelectItem>
                                    <SelectItem value="Publishing">Publishing</SelectItem>
                                    <SelectItem value="Brand Ambassador">Brand Ambassador</SelectItem>
                                    <SelectItem value="Image Rights">Image Rights</SelectItem>
                                    <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <Input placeholder="Value (e.g. R5M/yr)" value={deal.value} onChange={(e) => updateDeal(idx, "value", e.target.value)} className="h-8 text-xs" />
                                <Input type="date" placeholder="Start" value={deal.startDate} onChange={(e) => updateDeal(idx, "startDate", e.target.value)} className="h-8 text-xs" />
                                <Input type="date" placeholder="End" value={deal.endDate} onChange={(e) => updateDeal(idx, "endDate", e.target.value)} className="h-8 text-xs" />
                              </div>
                              <Select value={deal.status} onValueChange={(v) => updateDeal(idx, "status", v)}>
                                <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="negotiating">Negotiating</SelectItem>
                                  <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="docs" className="space-y-3">
                      <div>
                        <Label className="text-xs">Upload Documents (contracts, compliance, ID)</Label>
                        <div className="mt-1.5 border border-dashed border-border rounded-lg p-4 text-center">
                          <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" id="agent-doc-upload" />
                          <label htmlFor="agent-doc-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to upload or drag files here</span>
                            <span className="text-xs text-muted-foreground">PDF, DOC, JPG, PNG — max 20MB each</span>
                          </label>
                        </div>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 text-sm">
                                <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate text-foreground flex-1">{file.name}</span>
                                <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(0)}KB</span>
                                <button onClick={() => removeFile(idx)} className="shrink-0 hover:text-destructive transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  </ScrollArea>

                  {/* Summary & Submit */}
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      {clientName && <Badge variant="secondary" className="text-[10px]">{clientName}</Badge>}
                      {sportOrDiscipline && <Badge variant="secondary" className="text-[10px]">{sportOrDiscipline}</Badge>}
                      {preDeals.length > 0 && <Badge variant="secondary" className="text-[10px]">{preDeals.length} deal{preDeals.length > 1 ? "s" : ""}</Badge>}
                      {uploadedFiles.length > 0 && <Badge variant="secondary" className="text-[10px]">{uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""}</Badge>}
                      {engagementType && <Badge variant="secondary" className="text-[10px]">{engagementType}</Badge>}
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreateInvitation} disabled={isCreating || !clientName || !clientEmail}>
                      {isCreating ? (isUploading ? "Uploading documents..." : "Creating...") : "Create Profile & Generate Link"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
      {/* Bulk Import Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Bulk Client Import
            </DialogTitle>
            <DialogDescription>
              Review the {bulkPreview.length} client{bulkPreview.length !== 1 ? "s" : ""} found in your spreadsheet. Fix any errors before importing.
            </DialogDescription>
          </DialogHeader>

          {bulkImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Importing clients...</span>
                <span>{bulkProgress}%</span>
              </div>
              <Progress value={bulkProgress} className="h-2" />
            </div>
          )}

          <ScrollArea className="max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Sport/Discipline</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulkPreview.map((client, idx) => (
                  <TableRow key={idx} className={!client.valid ? "bg-destructive/5" : ""}>
                    <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-sm">{client.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{client.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] capitalize">{client.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{client.sport || "—"}</TableCell>
                    <TableCell>
                      {client.valid ? (
                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-500/10">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-500/10">
                          <AlertCircle className="w-3 h-3 mr-1" /> {client.error}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-3">
                <span className="text-green-600 font-medium">{bulkPreview.filter((c) => c.valid).length} valid</span>
                {bulkPreview.some((c) => !c.valid) && (
                  <span className="text-red-600 font-medium">{bulkPreview.filter((c) => !c.valid).length} errors</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={downloadBulkTemplate}>
                <Download className="w-3.5 h-3.5 mr-1" /> Download Template
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setBulkDialogOpen(false); setBulkPreview([]); }} disabled={bulkImporting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleBulkImport}
                disabled={bulkImporting || bulkPreview.filter((c) => c.valid).length === 0}
              >
                {bulkImporting ? `Importing... ${bulkProgress}%` : `Import ${bulkPreview.filter((c) => c.valid).length} Client${bulkPreview.filter((c) => c.valid).length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
          </div>
        </div>
      </div>
    </SidebarProvider>
    <AgentChatBot />
    <RemoveClientDialog
      open={!!removeTarget}
      onOpenChange={(o) => { if (!o) setRemoveTarget(null); }}
      invitationId={removeTarget?.id ?? null}
      clientName={removeTarget?.client_name ?? ""}
      clientUserId={removeTarget?.activated_user_id ?? null}
      onDone={fetchInvitations}
    />
    </>
  );
};

export default AgentDashboard;
