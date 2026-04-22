import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";

/**
 * useAgencyScope
 *
 * Returns the canonical "which agent_id should I scope read-queries by?"
 * for the current user. NOT necessarily the current user's id.
 *
 *  - If the user is the agency owner (or an admin viewing the dashboard as
 *    themselves), `scopedAgentId === user.id`.
 *  - If the user is an active staff member of an agency, `scopedAgentId` is
 *    that AGENCY OWNER's user id — the id every `agent_id` column on
 *    invitations/deals/meetings is keyed by.
 *
 * `isViewingAsStaff` is the gate for hiding write-action UI this sprint:
 * staff have view-only access until per-action RLS + audit trail are added.
 *
 * Always check `loading` before issuing queries — `scopedAgentId` will be
 * `null` while resolving and queries with a null filter return empty.
 */
export interface AgencyScope {
  /** The agent_id to scope read-queries by. Null while loading. */
  scopedAgentId: string | null;
  /** True when the current user is staff of another agency (not the owner). */
  isViewingAsStaff: boolean;
  /** Permitted dashboard sections (staff only; owners get all sections). */
  sections: string[];
  /** Display name of the agency being viewed (for badges/headers). */
  agencyName: string | null;
  /** Display name of the agency owner (for the staff context banner). */
  agencyOwnerName: string | null;
  /** Display label for the staff member's role (e.g. "Personal Assistant"). */
  roleLabel: string | null;
  loading: boolean;
}

export const useAgencyScope = (): AgencyScope => {
  const { user, loading: authLoading } = useAuth();
  const staff = useStaffAccess();

  const loading = authLoading || staff.loading;

  if (loading) {
    return {
      scopedAgentId: null,
      isViewingAsStaff: false,
      sections: [],
      agencyName: null,
      agencyOwnerName: null,
      roleLabel: null,
      loading: true,
    };
  }

  if (staff.isStaff && staff.agencyOwnerId) {
    return {
      scopedAgentId: staff.agencyOwnerId,
      isViewingAsStaff: true,
      sections: staff.sections,
      agencyName: staff.agencyName,
      agencyOwnerName: staff.agencyOwnerName,
      roleLabel: staff.roleLabel,
      loading: false,
    };
  }

  return {
    scopedAgentId: user?.id ?? null,
    isViewingAsStaff: false,
    sections: [],
    agencyName: null,
    agencyOwnerName: null,
    roleLabel: null,
    loading: false,
  };
};
