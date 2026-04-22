import { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import { useAgencyScope } from "@/hooks/useAgencyScope";

const DISMISS_KEY = "staff-banner-dismissed";

/**
 * StaffContextBanner
 *
 * Persona-clarity banner shown at the top of every agent-portal page when the
 * current viewer is staff (PA, junior agent, etc). Reinforces "you are
 * assisting {Owner} from {Agency}" so the staff member never confuses whose
 * data they're looking at. Coexists with the sidebar footer badge by design —
 * redundancy is useful here.
 *
 * - Self-hides for owners and admins.
 * - Dismissible per session via sessionStorage. Cleared on signOut so the
 *   next sign-in re-shows it.
 */
const StaffContextBanner = () => {
  const { isViewingAsStaff, agencyOwnerName, agencyName, sections, loading } = useAgencyScope();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });

  // Re-read on mount in case another tab cleared it (sign-out elsewhere).
  useEffect(() => {
    try { setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1"); } catch { /* noop */ }
  }, []);

  if (loading || !isViewingAsStaff || dismissed) return null;

  const handleDismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
    setDismissed(true);
  };

  const SECTION_LABELS: Record<string, string> = {
    clients: "Clients",
    pipeline: "Pipeline",
    compare: "Compare",
    calendar: "Calendar",
    templates: "Templates",
    share: "Share Portal",
    executive: "Executive Overview",
  };
  const sectionLabels = (sections ?? [])
    .map((s) => SECTION_LABELS[s] ?? s)
    .join(", ");

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-gold/30 bg-gold/10 text-foreground"
    >
      <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-3">
        <Eye className="w-4 h-4 shrink-0 text-gold-dark" aria-hidden="true" />
        <p className="text-sm leading-snug flex-1">
          You're working in <span className="font-semibold">{agencyName ?? "this"}</span>'s workspace
          {agencyOwnerName ? <> with <span className="font-semibold">{agencyOwnerName}</span></> : null}.
          {sectionLabels && (
            <> Edit access: <span className="font-medium">{sectionLabels}</span>.</>
          )}
          <span className="text-muted-foreground"> Your actions are attributed to you.</span>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss for this session"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StaffContextBanner;