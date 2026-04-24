import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const ALL_SECTIONS = [
  "clients",
  "pipeline",
  "compare",
  "calendar",
  "templates",
  "share",
  "executive",
] as const;

export interface StaffAccessState {
  isStaff: boolean;
  agencyOwnerId: string | null;
  agencyName: string | null;
  agencyOwnerName: string | null;
  sections: string[];
  roleLabel: string | null;
  loading: boolean;
  errored: boolean;
}

const initial: StaffAccessState = {
  isStaff: false,
  agencyOwnerId: null,
  agencyName: null,
  agencyOwnerName: null,
  sections: [...ALL_SECTIONS],
  roleLabel: null,
  loading: true,
  errored: false,
};

export function useStaffAccess(): StaffAccessState {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<StaffAccessState>(initial);
  const pollRef = useRef<number | null>(null);

  const fetchAccess = useCallback(async () => {
    if (!user) {
      setState({ ...initial, loading: false });
      return null;
    }

    const runQuery = () =>
      supabase
        .from("portal_staff_access")
        .select("agent_id, role_label, sections, status, confidentiality_accepted_at")
        .eq("staff_user_id", user.id)
        .eq("status", "active")
        .not("confidentiality_accepted_at", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1);

    let { data: rows, error } = await runQuery();

    if (error) {
      console.error("[useStaffAccess] portal_staff_access query failed, retrying in 1s", {
        userId: user.id, code: error.code, message: error.message,
      });
      await new Promise<void>((r) => setTimeout(r, 1000));
      ({ data: rows, error } = await runQuery());
      if (error) {
        console.error("[useStaffAccess] portal_staff_access retry failed", {
          userId: user.id, code: error.code, message: error.message,
        });
        setState({ ...initial, errored: true, loading: false });
        return null;
      }
    }

    const row = rows?.[0];
    if (!row) {
      setState({
        isStaff: false,
        agencyOwnerId: null,
        agencyName: null,
        agencyOwnerName: null,
        sections: [...ALL_SECTIONS],
        roleLabel: null,
        errored: false,
        loading: false,
      });
      return null;
    }

    const [{ data: agency }, { data: ownerProfile }] = await Promise.all([
      supabase
        .from("agent_manager_profiles")
        .select("company_name")
        .eq("user_id", row.agent_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", row.agent_id)
        .maybeSingle(),
    ]);

    setState({
      isStaff: true,
      agencyOwnerId: row.agent_id,
      agencyName: agency?.company_name ?? "Your Agency",
      agencyOwnerName: ownerProfile?.display_name ?? "your agent",
      sections: (row.sections as string[]) ?? [],
      roleLabel: row.role_label ?? "Staff",
      errored: false,
      loading: false,
    });
    return row;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    let subscribedOk = false;

    const handleRevoked = async () => {
      toast({ title: "Access revoked", description: "Your access to this agency has been revoked." });
      // Give the toast time to render and be readable before tearing down auth state
      await new Promise((r) => setTimeout(r, 1500));
      try { await supabase.auth.signOut(); } catch { /* noop */ }
      navigate("/auth");
    };

    fetchAccess().then((row) => {
      if (cancelled || !user) return;

      const channel = supabase
        .channel(`staff-access-watch-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "portal_staff_access",
            filter: `staff_user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "DELETE") {
              if (row) handleRevoked();
              return;
            }
            const next = payload.new as { status?: string; confidentiality_accepted_at?: string | null } | null;
            if (row && next && (next.status !== "active" || !next.confidentiality_accepted_at)) {
              handleRevoked();
              return;
            }
            fetchAccess();
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") subscribedOk = true;
        });

      // Fallback polling if realtime never connects within 10s
      window.setTimeout(() => {
        if (cancelled || subscribedOk) return;
        // eslint-disable-next-line no-console
        console.warn("[useStaffAccess] Realtime not connected; falling back to 2-min polling.");
        pollRef.current = window.setInterval(() => fetchAccess(), 120_000);
      }, 10_000);

      return () => {
        supabase.removeChannel(channel);
      };
    });

    return () => {
      cancelled = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return state;
}
