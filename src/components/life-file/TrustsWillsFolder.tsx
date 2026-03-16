import { useState } from "react";
import {
  FileText,
  FolderOpen,
  Folder,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  Share2,
  ChevronRight,
  Scale,
  ScrollText,
  Shield,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LifeFileDocument } from "@/types/lifeFile";
import { ESTATE_FOLDERS } from "@/types/lifeFile";

interface TrustsWillsFolderProps {
  documents: LifeFileDocument[];
  onAddDocument: (preselectedType?: string) => void;
  onEditDocument: (doc: LifeFileDocument) => void;
  onDeleteDocument: (doc: LifeFileDocument) => void;
  onShareSection: () => void;
}

const folderIcons: Record<string, React.ElementType> = {
  wills: ScrollText,
  trusts: Shield,
  poa: Scale,
  letters: BookOpen,
};

const TrustsWillsFolder = ({
  documents,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onShareSection,
}: TrustsWillsFolderProps) => {
  const [expandedFolder, setExpandedFolder] = useState<string | null>("wills");

  const getDocsByFolder = (folderKey: string) => {
    const folder = ESTATE_FOLDERS.find((f) => f.key === folderKey);
    if (!folder) return [];
    return documents.filter((d) =>
      folder.documentTypes.includes(d.document_type)
    );
  };

  const getFolderStats = (folderKey: string) => {
    const docs = getDocsByFolder(folderKey);
    const complete = docs.filter((d) => d.status === "complete").length;
    return { total: docs.length, complete };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Trusts & Wills
          </h3>
          <p className="text-sm text-muted-foreground">
            Estate planning documents organized by category — shareable with
            advisors & family
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onShareSection}>
            <Share2 className="w-4 h-4" />
            Share Section
          </Button>
          <Button size="sm" onClick={() => onAddDocument()}>
            <Plus className="w-4 h-4" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Folder List */}
      <div className="space-y-3">
        {ESTATE_FOLDERS.map((folder) => {
          const isExpanded = expandedFolder === folder.key;
          const FolderIcon = folderIcons[folder.key] || FileText;
          const docs = getDocsByFolder(folder.key);
          const stats = getFolderStats(folder.key);

          return (
            <div
              key={folder.key}
              className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden"
            >
              {/* Folder Header */}
              <button
                onClick={() =>
                  setExpandedFolder(isExpanded ? null : folder.key)
                }
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isExpanded
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {isExpanded ? (
                    <FolderOpen className="w-5 h-5" />
                  ) : (
                    <Folder className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{folder.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {folder.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {stats.total > 0 && (
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        stats.complete === stats.total
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {stats.complete}/{stats.total} complete
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border">
                  {/* Subfolder types */}
                  <div className="p-4 space-y-2">
                    {folder.subfolders.map((sub) => {
                      const subDocs = docs.filter(
                        (d) => d.document_type === sub.value
                      );

                      return (
                        <div key={sub.value}>
                          <div className="flex items-center justify-between py-2 px-3 bg-secondary/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FolderIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {sub.label}
                              </span>
                              {subDocs.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({subDocs.length})
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => onAddDocument(sub.value)}
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </Button>
                          </div>

                          {/* Documents in subfolder */}
                          {subDocs.length > 0 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {subDocs.map((d) => (
                                <div
                                  key={d.id}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {d.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      {d.expiry_date && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          Expires:{" "}
                                          {new Date(
                                            d.expiry_date
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                      {d.file_name && (
                                        <span className="flex items-center gap-1">
                                          <Download className="w-3 h-3" />
                                          {d.file_name}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status */}
                                  {d.status === "complete" ? (
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                  ) : (
                                    <AlertCircle
                                      className={cn(
                                        "w-4 h-4",
                                        d.status === "needs-update"
                                          ? "text-warning"
                                          : "text-destructive"
                                      )}
                                    />
                                  )}

                                  {/* Actions */}
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => onEditDocument(d)}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() => onDeleteDocument(d)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustsWillsFolder;
