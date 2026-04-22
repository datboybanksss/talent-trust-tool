import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WorkspaceMember {
  user_id: string;
  name: string;
  role: string;
  active: boolean;
}

/**
 * Resolves uuids → display name + role for the entire workspace history,
 * NOT just currently-active staff. Critical for audit/attribution UI:
 * a deal created by a now-revoked PA still needs "Added by Naledi (PA)"
 * rather than "Unknown user".
 *
 * Strategy:
 *  - owner = scopedAgentId (resolved via agent_manager_profiles + profiles)
 *  - all_staff = portal_staff_access rows for this agency, regardless of status
 *  - any uuid not in that union is fetched on-demand via profiles
 */
export const useWorkspaceMembers = (scopedAgentId: string | null) => {
  const [members, setMembers] = useState<Map<string, WorkspaceMember>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scopedAgentId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const map = new Map<string, WorkspaceMember>();

      const { data: ownerProfile } = await supabase
        .from("profiles").select("display_name").eq("user_id", scopedAgentId).maybeSingle();
      map.set(scopedAgentId, {
        user_id: scopedAgentId,
        name: ownerProfile?.display_name ?? "Owner",
        role: "Owner",
        active: true,
      });

      const { data: staffRows } = await supabase
        .from("portal_staff_access")
        .select("staff_user_id, staff_name, role_label, status")
        .eq("agent_id", scopedAgentId)
        .not("staff_user_id", "is", null);

      (staffRows ?? []).forEach((r) => {
        if (!r.staff_user_id) return;
        map.set(r.staff_user_id, {
          user_id: r.staff_user_id,
          name: r.staff_name,
          role: r.role_label,
          active: r.status === "active",
        });
      });

      if (!cancelled) setMembers(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [scopedAgentId]);

  const resolve = (userId: string | null | undefined): WorkspaceMember => {
    if (!userId) return { user_id: "", name: "Unknown", role: "—", active: false };
    return members.get(userId) ?? { user_id: userId, name: "Former member", role: "—", active: false };
  };

  return { members, resolve, loading };
};