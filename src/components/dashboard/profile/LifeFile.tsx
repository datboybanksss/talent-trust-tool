import { 
  Heart, 
  FileText, 
  Users, 
  Shield, 
  Key,
  AlertCircle,
  CheckCircle2,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LifeFileItem {
  name: string;
  status: "complete" | "incomplete" | "needs-update";
  lastUpdated?: string;
  icon: React.ElementType;
}

interface LifeFileProps {
  items: LifeFileItem[];
  beneficiaries: number;
  emergencyContacts: number;
}

const LifeFile = ({ items, beneficiaries, emergencyContacts }: LifeFileProps) => {
  const getStatusIcon = (status: LifeFileItem["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "incomplete":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "needs-update":
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusLabel = (status: LifeFileItem["status"]) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "incomplete":
        return "Missing";
      case "needs-update":
        return "Needs Update";
    }
  };

  const completedCount = items.filter(i => i.status === "complete").length;
  const completionPercentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Life File</h3>
            <p className="text-xs text-muted-foreground">Estate planning essentials</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Completion</span>
          <span className={cn(
            "font-medium",
            completionPercentage >= 80 ? "text-success" : 
            completionPercentage >= 50 ? "text-warning" : "text-destructive"
          )}>
            {completionPercentage}%
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              completionPercentage >= 80 ? "bg-success" : 
              completionPercentage >= 50 ? "bg-warning" : "bg-destructive"
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Users className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{beneficiaries}</p>
          <p className="text-xs text-muted-foreground">Beneficiaries</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Shield className="w-5 h-5 mx-auto text-gold mb-1" />
          <p className="text-lg font-bold text-foreground">{emergencyContacts}</p>
          <p className="text-xs text-muted-foreground">Emergency Contacts</p>
        </div>
      </div>

      {/* Life File Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                {item.lastUpdated && (
                  <p className="text-xs text-muted-foreground">Updated {item.lastUpdated}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              <span className={cn(
                "text-xs font-medium",
                item.status === "complete" ? "text-success" :
                item.status === "incomplete" ? "text-destructive" : "text-warning"
              )}>
                {getStatusLabel(item.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4" size="sm">
        <FileText className="w-4 h-4" />
        Manage Life File
      </Button>
    </div>
  );
};

export default LifeFile;
