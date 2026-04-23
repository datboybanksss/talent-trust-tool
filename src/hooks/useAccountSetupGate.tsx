import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { resolveAccountState } from "@/lib/accountState";

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

      // Resolve canonical state first.
      let resolved = await resolveAccountState(user);
      if (cancelled) return;

      // Pending staff → activation route (resolver already enforces precedence).
      if (resolved.state === "pending_staff" && resolved.pendingStaffToken) {
        resolvedForUserId.current = user.id;
        setState({
          loading: false,
          redirectTo: `/staff-activate/${resolved.pendingStaffToken}`,
        });
        return;
      }

      // Agent self-heal: metadata claims agent role but no agency row exists.
      // Run BEFORE concluding the account is incomplete so legacy users with
      // the right metadata never see /welcome.
      const needsSelfHeal =
        (resolved.state === "incomplete_existing" ||
          resolved.state === "incomplete_new" ||
          resolved.state === "agent") &&
        metaClientType &&
        AGENT_META_VALUES.has(metaClientType);

      if (needsSelfHeal) {
        // Re-check the row in case the resolver picked it up via metadata fallback.
        const { data: existingAgency } = await supabase
          .from("agent_manager_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;

        if (!existingAgency) {
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
          console.error("[useAccountSetupGate] self-heal failed:", error);
          } else {
            // Re-resolve so downstream consumers see the agent state.
            resolved = await resolveAccountState(user);
            if (cancelled) return;
        }
        }
      }

      // Incomplete in either flavour → /welcome.
      if (
        resolved.state === "incomplete_new" ||
        resolved.state === "incomplete_existing"
      ) {
        resolvedForUserId.current = user.id;
        setState({ loading: false, redirectTo: "/welcome" });
        return;
      }

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
