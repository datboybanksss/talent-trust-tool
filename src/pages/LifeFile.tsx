import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  Users,
  Phone,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Percent,
  MapPin,
  Calendar,
  Download,
  Loader2,
  Share2,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Beneficiary,
  EmergencyContact,
  LifeFileDocument,
  DOCUMENT_TYPES,
} from "@/types/lifeFile";
import {
  fetchBeneficiaries,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  fetchEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  fetchLifeFileDocuments,
  createLifeFileDocument,
  updateLifeFileDocument,
  deleteLifeFileDocument,
  uploadLifeFileDocument,
} from "@/services/lifeFileService";
import {
  fetchLifeFileShares,
  createLifeFileShare,
  updateLifeFileShare,
  deleteLifeFileShare,
  revokeLifeFileShare,
  LifeFileShare,
} from "@/services/lifeFileShareService";
import BeneficiaryDialog from "@/components/life-file/BeneficiaryDialog";
import EmergencyContactDialog from "@/components/life-file/EmergencyContactDialog";
import DocumentDialog from "@/components/life-file/DocumentDialog";
import ShareLifeFileDialog from "@/components/life-file/ShareLifeFileDialog";
import ShareList from "@/components/life-file/ShareList";
import TrustsWillsFolder from "@/components/life-file/TrustsWillsFolder";
import { generateLifeFilePDF } from "@/utils/lifeFilePdfExport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LifeFilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [documents, setDocuments] = useState<LifeFileDocument[]>([]);
  const [shares, setShares] = useState<LifeFileShare[]>([]);

  // Dialog states
  const [beneficiaryDialogOpen, setBeneficiaryDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editingDocument, setEditingDocument] = useState<LifeFileDocument | null>(null);
  const [editingShare, setEditingShare] = useState<LifeFileShare | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "beneficiary" | "contact" | "document" | "share";
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to access your Life File",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      setUserId(session.user.id);
      loadData(session.user.id);
    };

    checkAuth();
  }, [navigate, toast]);

  const loadData = async (uid: string) => {
    setLoading(true);
    try {
      const [benefs, conts, docs, shrs] = await Promise.all([
        fetchBeneficiaries(uid),
        fetchEmergencyContacts(uid),
        fetchLifeFileDocuments(uid),
        fetchLifeFileShares(uid),
      ]);
      setBeneficiaries(benefs || []);
      setContacts(conts || []);
      setDocuments(docs || []);
      setShares(shrs || []);
    } catch (error) {
      console.error("Error loading Life File data:", error);
      toast({
        title: "Error loading data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Beneficiary handlers
  const handleAddBeneficiary = async (data: any) => {
    if (!userId) return;
    await createBeneficiary({ ...data, user_id: userId });
    await loadData(userId);
    toast({ title: "Beneficiary added" });
  };

  const handleUpdateBeneficiary = async (data: any) => {
    if (!editingBeneficiary) return;
    await updateBeneficiary(editingBeneficiary.id, data);
    if (userId) await loadData(userId);
    toast({ title: "Beneficiary updated" });
  };

  // Contact handlers
  const handleAddContact = async (data: any) => {
    if (!userId) return;
    await createEmergencyContact({ ...data, user_id: userId });
    await loadData(userId);
    toast({ title: "Emergency contact added" });
  };

  const handleUpdateContact = async (data: any) => {
    if (!editingContact) return;
    await updateEmergencyContact(editingContact.id, data);
    if (userId) await loadData(userId);
    toast({ title: "Contact updated" });
  };

  // Document handlers
  const handleAddDocument = async (data: any, file?: File) => {
    if (!userId) return;
    
    let fileUrl = null;
    let fileName = null;
    
    if (file) {
      const result = await uploadLifeFileDocument(userId, file);
      fileUrl = result.path;
      fileName = file.name;
    }
    
    await createLifeFileDocument({
      ...data,
      user_id: userId,
      file_url: fileUrl,
      file_name: fileName,
    });
    await loadData(userId);
    toast({ title: "Document added" });
  };

  const handleUpdateDocument = async (data: any, file?: File) => {
    if (!editingDocument || !userId) return;
    
    let updates: any = { ...data };
    
    if (file) {
      const result = await uploadLifeFileDocument(userId, file);
      updates.file_url = result.path;
      updates.file_name = file.name;
    }
    
    await updateLifeFileDocument(editingDocument.id, updates);
    await loadData(userId);
    toast({ title: "Document updated" });
  };

  // Share handlers
  const handleAddShare = async (data: any) => {
    if (!userId) return;
    try {
      await createLifeFileShare({
        ...data,
        owner_id: userId,
        status: "pending",
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      });
      await loadData(userId);
      toast({ title: "Invitation sent" });
    } catch (error: any) {
      if (error.code === "23505") {
        toast({ title: "This person already has access", variant: "destructive" });
      } else {
        toast({ title: "Error sending invitation", variant: "destructive" });
      }
    }
  };

  const handleUpdateShare = async (data: any) => {
    if (!editingShare || !userId) return;
    await updateLifeFileShare(editingShare.id, {
      ...data,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
    });
    await loadData(userId);
    toast({ title: "Share updated" });
  };

  const handleRevokeShare = async (share: LifeFileShare) => {
    if (!userId) return;
    await revokeLifeFileShare(share.id);
    await loadData(userId);
    toast({ title: "Access revoked" });
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget || !userId) return;
    
    try {
      switch (deleteTarget.type) {
        case "beneficiary":
          await deleteBeneficiary(deleteTarget.id);
          break;
        case "contact":
          await deleteEmergencyContact(deleteTarget.id);
          break;
        case "document":
          await deleteLifeFileDocument(deleteTarget.id);
          break;
        case "share":
          await deleteLifeFileShare(deleteTarget.id);
          break;
      }
      await loadData(userId);
      toast({ title: `${deleteTarget.type} deleted` });
    } catch (error) {
      toast({ title: "Error deleting", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const totalAllocation = beneficiaries.reduce(
    (sum, b) => sum + (Number(b.allocation_percentage) || 0),
    0
  );

  const completedDocs = documents.filter((d) => d.status === "complete").length;

  if (loading) {
    return (
      <DashboardLayout title="Life File" subtitle="Estate planning essentials">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Life File"
      subtitle="Manage your estate planning essentials"
    >
      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Estate Planning</h2>
              <p className="text-sm opacity-80">Secure your legacy for loved ones</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{beneficiaries.length}</p>
              <p className="text-xs opacity-80">Beneficiaries</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{contacts.length}</p>
              <p className="text-xs opacity-80">Contacts</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">
                {completedDocs}/{documents.length}
              </p>
              <p className="text-xs opacity-80">Docs Complete</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{shares.filter(s => s.status === "accepted").length}</p>
              <p className="text-xs opacity-80">Shared With</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>All Life File data is encrypted and only accessible by you</span>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            generateLifeFilePDF({
              beneficiaries,
              emergencyContacts: contacts,
              documents,
              userName: "John Doe", // TODO: Replace with actual user name from auth
            });
            toast({ title: "PDF downloaded successfully" });
          }}
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="beneficiaries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Beneficiaries
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Emergency Contacts
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Sharing
          </TabsTrigger>
        </TabsList>

        {/* Beneficiaries Tab */}
        <TabsContent value="beneficiaries" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Beneficiaries</h3>
              <p className="text-sm text-muted-foreground">
                People who will inherit your assets
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingBeneficiary(null);
                setBeneficiaryDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Beneficiary
            </Button>
          </div>

          {totalAllocation > 0 && (
            <div
              className={cn(
                "p-4 rounded-xl flex items-center gap-3",
                totalAllocation === 100
                  ? "bg-success/10 text-success"
                  : totalAllocation > 100
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
              )}
            >
              <Percent className="w-5 h-5" />
              <span className="text-sm font-medium">
                Total allocation: {totalAllocation}%
                {totalAllocation !== 100 && " (should equal 100%)"}
              </span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {beneficiaries.map((b) => (
              <div
                key={b.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-soft"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{b.full_name}</p>
                      <p className="text-xs text-muted-foreground">{b.relationship}</p>
                    </div>
                  </div>
                  {b.allocation_percentage && (
                    <span className="text-lg font-bold text-gold">
                      {Number(b.allocation_percentage)}%
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {b.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{b.email}</span>
                    </div>
                  )}
                  {b.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{b.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBeneficiary(b);
                      setBeneficiaryDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeleteTarget({ type: "beneficiary", id: b.id, name: b.full_name });
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {beneficiaries.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-secondary/30 rounded-2xl">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No beneficiaries added yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setBeneficiaryDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Beneficiary
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Emergency Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Emergency Contacts</h3>
              <p className="text-sm text-muted-foreground">
                People to contact in case of emergency
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingContact(null);
                setContactDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </div>

          <div className="space-y-3">
            {contacts.map((c, index) => (
              <div
                key={c.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-soft flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold">
                  {c.priority}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{c.full_name}</p>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                      {c.relationship}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </div>
                  {c.address && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{c.address}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingContact(c);
                      setContactDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeleteTarget({ type: "contact", id: c.id, name: c.full_name });
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {contacts.length === 0 && (
              <div className="text-center py-12 bg-secondary/30 rounded-2xl">
                <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No emergency contacts added yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setContactDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Contact
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Estate Documents</h3>
              <p className="text-sm text-muted-foreground">
                Important legal and financial documents
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingDocument(null);
                setDocumentDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Document
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((d) => {
              const docType = DOCUMENT_TYPES.find((t) => t.value === d.document_type);
              return (
                <div
                  key={d.id}
                  className={cn(
                    "bg-card rounded-2xl border p-5 shadow-soft",
                    d.status === "complete"
                      ? "border-success/30"
                      : d.status === "needs-update"
                      ? "border-warning/30"
                      : "border-destructive/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    {d.status === "complete" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle
                        className={cn(
                          "w-5 h-5",
                          d.status === "needs-update" ? "text-warning" : "text-destructive"
                        )}
                      />
                    )}
                  </div>

                  <p className="font-medium text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {docType?.label || d.document_type}
                  </p>

                  {d.expiry_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {new Date(d.expiry_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {d.file_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Download className="w-4 h-4" />
                      <span className="truncate">{d.file_name}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDocument(d);
                        setDocumentDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleteTarget({ type: "document", id: d.id, name: d.title });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {documents.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-secondary/30 rounded-2xl">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No documents added yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setDocumentDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Document
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Shared Access</h3>
              <p className="text-sm text-muted-foreground">
                Manage who can view your Life File information
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingShare(null);
                setShareDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Share Life File
            </Button>
          </div>

          <ShareList
            shares={shares}
            onEdit={(share) => {
              setEditingShare(share);
              setShareDialogOpen(true);
            }}
            onRevoke={handleRevokeShare}
            onDelete={(share) => {
              setDeleteTarget({ type: "share", id: share.id, name: share.shared_with_email });
              setDeleteDialogOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BeneficiaryDialog
        open={beneficiaryDialogOpen}
        onOpenChange={setBeneficiaryDialogOpen}
        onSubmit={editingBeneficiary ? handleUpdateBeneficiary : handleAddBeneficiary}
        beneficiary={editingBeneficiary}
      />

      <EmergencyContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSubmit={editingContact ? handleUpdateContact : handleAddContact}
        contact={editingContact}
      />

      <DocumentDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument}
        document={editingDocument}
      />

      <ShareLifeFileDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onSubmit={editingShare ? handleUpdateShare : handleAddShare}
        existingShare={editingShare}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default LifeFilePage;
