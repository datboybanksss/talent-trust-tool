import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useStaffAccess } from "@/hooks/useStaffAccess";

interface SectionGuardProps {
  section?: string;
  ownerOnly?: boolean;
  children: React.ReactNode;
}

const SectionGuard = ({ section, ownerOnly, children }: SectionGuardProps) => {
  const { isStaff, sections, loading } = useStaffAccess();
  if (loading) return null;

  // Owners always pass through
  if (!isStaff) return <>{children}</>;

  if (ownerOnly) return <AccessDenied reason="owner" />;
  if (section && !sections.includes(section)) return <AccessDenied reason="section" />;
  return <>{children}</>;
};

const AccessDenied = ({ reason }: { reason: "owner" | "section" }) => (
  <Card className="border-border/50">
    <CardContent className="p-8 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
        <ShieldAlert className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">Access denied</h3>
        <p className="text-sm text-muted-foreground">
          {reason === "owner"
            ? "This section is only available to agency owners."
            : "You don't have access to this section. Ask your agency admin to grant access from the Share Portal."}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default SectionGuard;
