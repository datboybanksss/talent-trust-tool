import { Button } from "@/components/ui/button";
import { 
  LifeFileShare, 
  ACCESS_LEVELS,
  SHARE_SECTIONS 
} from "@/services/lifeFileShareService";
import { 
  Users, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Pencil,
  Trash2,
  Ban,
  Shield,
  Eye,
  FileText,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ShareListProps {
  shares: LifeFileShare[];
  onEdit: (share: LifeFileShare) => void;
  onRevoke: (share: LifeFileShare) => void;
  onDelete: (share: LifeFileShare) => void;
}

const ShareList = ({ shares, onEdit, onRevoke, onDelete }: ShareListProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/20 text-success">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "declined":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      case "revoked":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            <Ban className="w-3 h-3" />
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case "full":
        return <Shield className="w-4 h-4 text-primary" />;
      case "emergency":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Eye className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "beneficiaries":
        return <Users className="w-3 h-3" />;
      case "contacts":
        return <Phone className="w-3 h-3" />;
      case "documents":
        return <FileText className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (shares.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/30 rounded-2xl">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No shares yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Share your Life File with trusted family members or advisors
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shares.map((share) => {
        const accessLevel = ACCESS_LEVELS.find((l) => l.value === share.access_level);
        const isExpired = share.expires_at && new Date(share.expires_at) < new Date();
        
        return (
          <div
            key={share.id}
            className={cn(
              "bg-card rounded-2xl border p-5 shadow-soft",
              isExpired ? "border-destructive/30 opacity-60" : "border-border"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {getAccessIcon(share.access_level)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{share.shared_with_email}</p>
                  <p className="text-xs text-muted-foreground">{share.relationship}</p>
                </div>
              </div>
              {getStatusBadge(share.status)}
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>{accessLevel?.label || share.access_level}</span>
              </div>
              
              {share.expires_at && (
                <div className={cn(
                  "flex items-center gap-2",
                  isExpired ? "text-destructive" : "text-muted-foreground"
                )}>
                  <Clock className="w-4 h-4" />
                  <span>
                    {isExpired ? "Expired" : `Expires ${format(new Date(share.expires_at), "MMM d, yyyy")}`}
                  </span>
                </div>
              )}
            </div>

            {/* Sections */}
            <div className="flex flex-wrap gap-2 mb-4">
              {share.sections?.map((section) => {
                const sectionInfo = SHARE_SECTIONS.find((s) => s.value === section);
                return (
                  <span
                    key={section}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground"
                  >
                    {getSectionIcon(section)}
                    {sectionInfo?.label || section}
                  </span>
                );
              })}
            </div>

            {share.message && (
              <p className="text-sm text-muted-foreground italic mb-4">
                "{share.message}"
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Shared {format(new Date(share.created_at), "MMM d, yyyy")}
              </span>
              
              <div className="flex gap-2">
                {share.status === "pending" && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(share)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                {share.status === "accepted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-warning hover:text-warning"
                    onClick={() => onRevoke(share)}
                  >
                    <Ban className="w-4 h-4" />
                    Revoke
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(share)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShareList;
