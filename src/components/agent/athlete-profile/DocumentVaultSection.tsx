import { VaultDocument } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderOpen, FileText, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Props { data: VaultDocument[] }

const DocumentVaultSection = ({ data }: Props) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(data.map((d) => d.category)))];
  const filtered = data.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.tags.some((t) => t.includes(search.toLowerCase()));
    const matchCategory = categoryFilter === "all" || d.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const expiringCount = data.filter((d) => d.status === "expiring_soon").length;
  const expiredCount = data.filter((d) => d.status === "expired").length;

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 p-2 px-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">{expiredCount} expired document(s)</span>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="flex items-center gap-2 p-2 px-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-warning">{expiringCount} expiring soon</span>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search documents or tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" /> Documents ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Document</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Tags</TableHead>
                <TableHead className="text-xs">Ver</TableHead>
                <TableHead className="text-xs">Uploaded</TableHead>
                <TableHead className="text-xs">Expiry</TableHead>
                <TableHead className="text-xs">By</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {d.title}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {d.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-center">v{d.version}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.uploadedAt}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.expiryDate || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.uploadedBy}</TableCell>
                  <TableCell>
                    <Badge
                      variant={d.status === "current" ? "default" : d.status === "expired" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {d.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentVaultSection;
