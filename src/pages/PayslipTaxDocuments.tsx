import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  File,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  PayslipTaxDocument,
  REQUIRED_TAX_DOCUMENTS,
  fetchPayslipTaxDocuments,
  createPayslipTaxDocument,
  deletePayslipTaxDocument,
  uploadPayslipTaxFile,
  deletePayslipTaxFile,
  getMissingDocuments,
} from "@/services/payslipTaxService";

type Category = "personal" | "business";

const currentYear = new Date().getFullYear().toString();
const taxYears = Array.from({ length: 5 }, (_, i) => (parseInt(currentYear) - i).toString());

const PayslipTaxDocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PayslipTaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    document_type: "",
    tax_year: currentYear,
    notes: "",
    file: null as File | null,
  });

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchPayslipTaxDocuments(user.id);
      setDocuments(data);
    } catch (err) {
      console.error("Error loading documents:", err);
      toast({ title: "Error", description: "Failed to load documents", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const missingDocs = user ? getMissingDocuments(documents, category) : [];
  const filteredDocs = documents.filter(
    (d) =>
      d.category === category &&
      (searchQuery === "" ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.document_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpload = async () => {
    if (!user) return;
    if (!uploadForm.title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }
    if (!uploadForm.document_type) {
      toast({ title: "Error", description: "Please select a document type", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      if (uploadForm.file) {
        if (uploadForm.file.size > 10 * 1024 * 1024) {
          toast({ title: "Error", description: "File must be under 10MB", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        const result = await uploadPayslipTaxFile(user.id, uploadForm.file);
        fileUrl = result.url;
        fileName = uploadForm.file.name;
      }

      await createPayslipTaxDocument({
        user_id: user.id,
        title: uploadForm.title,
        document_type: uploadForm.document_type,
        category,
        tax_year: uploadForm.tax_year,
        notes: uploadForm.notes || undefined,
        file_url: fileUrl,
        file_name: fileName,
      });

      toast({ title: "Success", description: "Document added successfully" });
      setUploadForm({ title: "", document_type: "", tax_year: currentYear, notes: "", file: null });
      setIsUploadOpen(false);
      loadDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: "Error", description: "Failed to upload document", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doc: PayslipTaxDocument) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      if (doc.file_url) {
        const path = doc.file_url.split("/payslip-tax-documents/")[1];
        if (path) await deletePayslipTaxFile(path);
      }
      await deletePayslipTaxDocument(doc.id);
      toast({ title: "Deleted", description: "Document removed" });
      loadDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadForm((prev) => ({ ...prev, file }));
      setIsUploadOpen(true);
    }
  }, []);

  const requiredDocTypes = REQUIRED_TAX_DOCUMENTS[category];

  return (
    <DashboardLayout
      title="My Payslip & Tax Documents"
      subtitle="Securely store payslips, tax returns, and compliance documents"
    >
      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Tabs value={category} onValueChange={(v) => setCategory(v as Category)}>
          <TabsList>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary w-56"
            />
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Missing Documents Alert */}
      {missingDocs.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">
              Missing Documents Reminder ({missingDocs.length})
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            The following {category} tax documents are required but haven't been uploaded yet:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {missingDocs.map((doc) => (
              <div
                key={doc.type}
                className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 cursor-pointer hover:bg-background transition-colors"
                onClick={() => {
                  setUploadForm((prev) => ({ ...prev, document_type: doc.type, title: doc.label }));
                  setIsUploadOpen(true);
                }}
              >
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredDocs.length}</p>
              <p className="text-xs text-muted-foreground">Documents Uploaded</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {requiredDocTypes.length - missingDocs.length}/{requiredDocTypes.length}
              </p>
              <p className="text-xs text-muted-foreground">Required Complete</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              missingDocs.length > 0 ? "bg-destructive/10" : "bg-green-500/10"
            )}>
              {missingDocs.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{missingDocs.length}</p>
              <p className="text-xs text-muted-foreground">Missing Documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary text-sm font-medium text-muted-foreground">
          <div className="col-span-4">Document</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Tax Year</div>
          <div className="col-span-2">Date Added</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No {category} documents uploaded yet</p>
            <Button variant="outline" className="mt-3" onClick={() => setIsUploadOpen(true)}>
              <Plus className="w-4 h-4" /> Upload Your First Document
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredDocs.map((doc) => {
              const typeLabel =
                requiredDocTypes.find((r) => r.type === doc.document_type)?.label || doc.document_type;
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/50 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <File className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.title}</p>
                      {doc.file_name && (
                        <p className="text-xs text-muted-foreground truncate">{doc.file_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary" className="text-xs truncate max-w-full">
                      {typeLabel}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {doc.tax_year || "—"}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => setIsUploadOpen(true)}
        className={cn(
          "mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary"
        )}
      >
        <Upload className={cn("w-8 h-8 mx-auto mb-2", isDragging ? "text-primary" : "text-muted-foreground")} />
        <p className="font-medium text-foreground">
          {isDragging ? "Drop your file here" : "Drag & drop files here to upload"}
        </p>
        <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add {category === "personal" ? "Personal" : "Business"} Tax Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                value={uploadForm.document_type}
                onValueChange={(v) => {
                  const match = requiredDocTypes.find((r) => r.type === v);
                  setUploadForm((prev) => ({
                    ...prev,
                    document_type: v,
                    title: match ? match.label : prev.title,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {requiredDocTypes.map((t) => (
                    <SelectItem key={t.type} value={t.type}>
                      {t.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Document title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tax Year</Label>
              <Select
                value={uploadForm.tax_year}
                onValueChange={(v) => setUploadForm((prev) => ({ ...prev, tax_year: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taxYears.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Attach File</Label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setUploadForm((prev) => ({ ...prev, file }));
                }}
              />
              {uploadForm.file ? (
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm flex-1 truncate">{uploadForm.file.name}</span>
                  <button onClick={() => setUploadForm((prev) => ({ ...prev, file: null }))}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" /> Choose File
                </Button>
              )}
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG, XLS (max 10MB)</p>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                className="resize-none"
                value={uploadForm.notes}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <Button onClick={handleUpload} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isSubmitting ? "Uploading..." : "Add Document"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PayslipTaxDocumentsPage;
