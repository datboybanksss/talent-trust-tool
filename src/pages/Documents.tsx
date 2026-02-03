import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  FolderLock, 
  FileText, 
  Upload, 
  Download, 
  Trash2,
  Search,
  Filter,
  FolderPlus,
  File,
  FileImage,
  Eye,
  X
} from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Documents = () => {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "",
    file: null as File | null,
  });

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validTypes.includes(fileExtension)) {
        setUploadForm(prev => ({ ...prev, file }));
        setIsUploadOpen(true);
        toast({ title: "File selected", description: `"${file.name}" ready to upload. Please fill in the details.` });
      } else {
        toast({ title: "Invalid file type", description: "Please upload PDF, DOC, DOCX, JPG, or PNG files only.", variant: "destructive" });
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadForm(prev => ({ ...prev, file }));
  };

  const handleUpload = () => {
    if (!uploadForm.title.trim()) {
      toast({ title: "Error", description: "Please enter a document title", variant: "destructive" });
      return;
    }
    if (!uploadForm.category) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }
    if (!uploadForm.file) {
      toast({ title: "Error", description: "Please select a file to upload", variant: "destructive" });
      return;
    }

    // TODO: Integrate with Supabase storage when auth is implemented
    toast({ title: "Success", description: `"${uploadForm.title}" uploaded to ${uploadForm.category}` });
    setUploadForm({ title: "", category: "", file: null });
    setIsUploadOpen(false);
  };

  const categories = [
    { value: "Company", label: "Company Documents" },
    { value: "Compliance", label: "Compliance" },
    { value: "Contracts", label: "Contracts" },
    { value: "Tax", label: "Tax Documents" },
    { value: "Personal", label: "Personal ID" },
  ];

  return (
    <DashboardLayout 
      title="Document Vault" 
      subtitle="Securely store and manage all your company documents"
    >
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - Folders */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-soft h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Folders</h3>
            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <FolderPlus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  selectedFolder === folder.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                <FolderLock className="w-4 h-4" />
                <span className="flex-1 text-sm">{folder.name}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  selectedFolder === folder.id
                    ? "bg-primary-foreground/20"
                    : "bg-secondary"
                )}>
                  {folder.count}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gold/10 rounded-xl border border-gold/30">
            <div className="flex items-center gap-2 mb-2">
              <FolderLock className="w-5 h-5 text-gold" />
              <span className="font-medium text-foreground">Storage</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gold rounded-full" style={{ width: "35%" }} />
            </div>
            <p className="text-xs text-muted-foreground">3.5 GB of 10 GB used</p>
          </div>
        </div>

        {/* Main Content - Documents */}
        <div className="lg:col-span-3">
          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 bg-card rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold" size="sm">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter document title..."
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={uploadForm.category}
                        onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">File</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-gold transition-colors cursor-pointer">
                        <input
                          id="file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                          {uploadForm.file ? (
                            <div className="flex items-center justify-center gap-2">
                              <FileText className="w-5 h-5 text-gold" />
                              <span className="text-sm font-medium">{uploadForm.file.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setUploadForm(prev => ({ ...prev, file: null }));
                                }}
                                className="p-1 hover:bg-secondary rounded"
                              >
                                <X className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Click to select a file
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, DOC, DOCX, JPG, PNG
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <Button onClick={handleUpload} variant="gold" className="w-full">
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </div>
          </div>

          {/* Upload Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => setIsUploadOpen(true)}
            className={cn(
              "mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
              isDragging 
                ? "border-gold bg-gold/10 scale-[1.02]" 
                : "border-border hover:border-gold"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
              isDragging ? "bg-gold/20" : "bg-secondary"
            )}>
              <Upload className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-gold" : "text-muted-foreground"
              )} />
            </div>
            <p className="font-medium text-foreground mb-1">
              {isDragging ? "Drop your file here" : "Drop files here to upload"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isDragging ? "PDF, DOC, DOCX, JPG, PNG" : "or click to browse from your computer"}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image";
  category: string;
  date: string;
  size: string;
}

interface DocumentRowProps {
  document: Document;
}

const DocumentRow = ({ document }: DocumentRowProps) => {
  const getIcon = () => {
    switch (document.type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-destructive" />;
      case "image":
        return <FileImage className="w-5 h-5 text-info" />;
      default:
        return <File className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/50 transition-colors">
      <div className="col-span-5 flex items-center gap-3">
        {getIcon()}
        <span className="font-medium text-foreground truncate">{document.name}</span>
      </div>
      <div className="col-span-2">
        <span className="text-sm text-muted-foreground">{document.category}</span>
      </div>
      <div className="col-span-2">
        <span className="text-sm text-muted-foreground">{document.date}</span>
      </div>
      <div className="col-span-1">
        <span className="text-sm text-muted-foreground">{document.size}</span>
      </div>
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Eye className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Download className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

const folders = [
  { id: "all", name: "All Documents", count: 24 },
  { id: "company", name: "Company Documents", count: 8 },
  { id: "compliance", name: "Compliance", count: 6 },
  { id: "contracts", name: "Contracts", count: 5 },
  { id: "tax", name: "Tax Documents", count: 3 },
  { id: "personal", name: "Personal ID", count: 2 },
];

const documents: Document[] = [
  {
    id: "1",
    name: "Memorandum of Incorporation.pdf",
    type: "pdf",
    category: "Company",
    date: "Jan 15, 2026",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Company Registration Certificate.pdf",
    type: "pdf",
    category: "Company",
    date: "Jan 10, 2026",
    size: "1.2 MB",
  },
  {
    id: "3",
    name: "Director Resolution - Bank Account.docx",
    type: "doc",
    category: "Compliance",
    date: "Jan 8, 2026",
    size: "156 KB",
  },
  {
    id: "4",
    name: "ID Document - John Doe.jpg",
    type: "image",
    category: "Personal",
    date: "Dec 20, 2025",
    size: "3.1 MB",
  },
  {
    id: "5",
    name: "Sponsorship Agreement - Nike.pdf",
    type: "pdf",
    category: "Contracts",
    date: "Dec 15, 2025",
    size: "4.5 MB",
  },
  {
    id: "6",
    name: "Tax Clearance Certificate.pdf",
    type: "pdf",
    category: "Tax",
    date: "Dec 10, 2025",
    size: "890 KB",
  },
];

export default Documents;
