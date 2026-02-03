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
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Documents = () => {
  const [selectedFolder, setSelectedFolder] = useState("all");

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
              <Button variant="gold" size="sm">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
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
          <div className="mt-6 border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-gold transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">Drop files here to upload</p>
            <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
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
