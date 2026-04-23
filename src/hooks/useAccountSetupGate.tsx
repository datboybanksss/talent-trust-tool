import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Resolves an authenticated user's "first-load setup" requirements before any
 * dashboard renders. Order of precedence (matches Stabilisation Sprint spec):
 *
 *   1. Pending staff confidentiality      → /staff-activate/:token
 *   2. Agent self-heal (auto-insert)      → silent, no redirect
 *   3. No role at all                     → /welcome
 *   4. Otherwise                          → ready (no redirect)
 *
 * Bypassed routes (already handled or part of the setup flow itself):
 *   /welcome, /auth, /reset-password, /staff-activate/:token,
 *   /activate/:token, /client-activate/:token
 *
 * The hook is safe to call inside a route guard; it short-circuits when there
 * is no user or the user is unverified (those are handled upstream).
 */

const AGENT_META_VALUES = new Set(["athlete_agent", "artist_manager"]);
const CLIENT_META_VALUES = new Set(["athlete", "artist"]);

interface GateState {
  loading: boolean;
  redirectTo: string | null;
}

export function useAccountSetupGate(): GateState {
  const { user } = useAuth();
  const [state, setState] = useState<GateState>({ loading: true, redirectTo: null });
  const resolvedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !user.email_confirmed_at) {
      setState({ loading: false, redirectTo: null });
      resolvedForUserId.current = null;
      return;
    }

    if (resolvedForUserId.current === user.id) return;

    let cancelled = false;
    setState({ loading: true, redirectTo: null });

    (async () => {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const metaClientType = typeof meta.client_type === "string" ? meta.client_type : null;

      // Run the four checks in parallel — each one is cheap.
      const [
        adminRes,
        agencyRes,
        activeStaffRes,
        pendingStaffRes,
        profileRes,
      ] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
        supabase
          .from("agent_manager_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("portal_staff_access")
          .select("id")
          .eq("staff_user_id", user.id)
          .eq("status", "active")
          .not("confidentiality_accepted_at", "is", null)
          .limit(1),
        supabase
          .from("portal_staff_access")
          .select("invitation_token, agent_id")
          .eq("staff_user_id", user.id)
          .is("confidentiality_accepted_at", null)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("profiles")
          .select("client_type")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const isAdmin = !!adminRes.data;
      const hasAgency = !!agencyRes.data;
      const isActiveStaff = (activeStaffRes.data?.length ?? 0) > 0;
      const pendingStaff = pendingStaffRes.data?.[0] ?? null;
      const clientType = profileRes.data?.client_type ?? null;

      // ── Step 1: Pending staff confidentiality wins over everything except admin.
      if (!isAdmin && !hasAgency && !isActiveStaff && pendingStaff) {
        resolvedForUserId.current = user.id;
        setState({
          loading: false,
          redirectTo: `/staff-activate/${pendingStaff.invitation_token}`,
        });
        return;
      }

      // ── Step 2: Agent self-heal. Metadata says "agent" but no agency row exists.
      if (!hasAgency && metaClientType && AGENT_META_VALUES.has(metaClientType)) {
        const role =
          metaClientType === "artist_manager" ? "artist_manager" : "athlete_agent";
        const company =
          (typeof meta.company_name === "string" && meta.company_name.trim()) ||
          (typeof meta.display_name === "string" && meta.display_name.trim()) ||
          "My Agency";
        const phone = typeof meta.phone === "string" ? meta.phone : null;
        const regNo =
          typeof meta.registration_number === "string"
            ? meta.registration_number
            : null;

        const { error } = await supabase.from("agent_manager_profiles").insert({
          user_id: user.id,
          role,
          company_name: company,
          phone,
          registration_number: regNo,
        });
        if (cancelled) return;
        if (error) {
          // Don't loop forever — treat as resolved and let the user reach
          // the dashboard; they can still complete details from /myagency.
          console.error("[useAccountSetupGate] self-heal failed:", error);
        }
        resolvedForUserId.current = user.id;
        setState({ loading: false, redirectTo: null });
        return;
      }

      // ── Step 3: No role at all → /welcome.
      const hasAnyRole =
        isAdmin ||
        hasAgency ||
        isActiveStaff ||
        clientType === "athlete" ||
        clientType === "artist" ||
        (metaClientType && CLIENT_META_VALUES.has(metaClientType));

      if (!hasAnyRole) {
        resolvedForUserId.current = user.id;
        setState({ loading: false, redirectTo: "/welcome" });
        return;
      }

      // ── Step 4: All good.
      resolvedForUserId.current = user.id;
      setState({ loading: false, redirectTo: null });
    })().catch((err) => {
      if (!cancelled) {
        console.error("[useAccountSetupGate] unexpected error:", err);
        setState({ loading: false, redirectTo: null });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return state;
}
