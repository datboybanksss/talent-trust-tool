import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Canonical account-state resolver.
 *
 * Single source of truth for "what is this signed-in user?" — every
 * post-login redirect, route guard, and the /welcome page consume this so
 * we never have two parts of the app disagreeing about whether a user is
 * complete.
 */

export type AccountState =
  | "unauthenticated"
  | "unverified"
  | "pending_staff"
  | "admin"
  | "agent"
  | "staff"
  | "athlete"
  | "artist"
  | "incomplete_new"
  | "incomplete_existing";

export interface AccountStateResult {
  state: AccountState;
  /** Set when state === "pending_staff" — the activation token to redirect to. */
  pendingStaffToken: string | null;
}

const AGENT_META_VALUES = new Set(["athlete_agent", "artist_manager"]);

/**
 * Resolve the canonical state for a given user. Pure async function so it
 * can be reused outside React (e.g. one-shot post-login redirect).
 */
export async function resolveAccountState(
  user: User | null,
): Promise<AccountStateResult> {
  if (!user) return { state: "unauthenticated", pendingStaffToken: null };
  if (!user.email_confirmed_at) {
    return { state: "unverified", pendingStaffToken: null };
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metaClientType =
    typeof meta.client_type === "string" ? meta.client_type : null;

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
      .select("invitation_token")
      .eq("staff_user_id", user.id)
      .is("confidentiality_accepted_at", null)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("profiles")
      .select("client_type, created_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isAdmin = !!adminRes.data;
  const hasAgency = !!agencyRes.data;
  const isActiveStaff = (activeStaffRes.data?.length ?? 0) > 0;
  const pendingStaff = pendingStaffRes.data?.[0] ?? null;
  const profile = profileRes.data ?? null;
  const clientType = profile?.client_type ?? null;

  // Pending staff confidentiality wins over everything except admin.
  if (!isAdmin && !hasAgency && !isActiveStaff && pendingStaff) {
    return {
      state: "pending_staff",
      pendingStaffToken: String(pendingStaff.invitation_token),
    };
  }

  if (isAdmin) return { state: "admin", pendingStaffToken: null };
  if (hasAgency) return { state: "agent", pendingStaffToken: null };
  if (isActiveStaff) return { state: "staff", pendingStaffToken: null };
  if (clientType === "athlete") return { state: "athlete", pendingStaffToken: null };
  if (clientType === "artist") return { state: "artist", pendingStaffToken: null };

  // Metadata fallbacks for accounts mid-self-heal (treated as roles for
  // routing purposes — the gate runs the actual self-heal insert).
  if (metaClientType && AGENT_META_VALUES.has(metaClientType)) {
    return { state: "agent", pendingStaffToken: null };
  }
  if (metaClientType === "athlete") {
    return { state: "athlete", pendingStaffToken: null };
  }
  if (metaClientType === "artist") {
    return { state: "artist", pendingStaffToken: null };
  }

  // No role, no metadata. Distinguish brand-new vs legacy by whether the
  // profile row already exists (handle_new_user has run and the row has
  // had time to settle — we treat any existing profile as "existing").
  if (profile) return { state: "incomplete_existing", pendingStaffToken: null };
  return { state: "incomplete_new", pendingStaffToken: null };
}

/**
 * Map a canonical state to its dashboard route. Returns null for states
 * that need special handling by the caller (unauthenticated, unverified,
 * pending_staff, incomplete_*).
 */
export function dashboardForState(state: AccountState): string | null {
  switch (state) {
    case "admin":
      return "/admin";
    case "agent":
    case "staff":
      return "/agent-dashboard";
    case "athlete":
    case "artist":
      return "/dashboard";
    default:
      return null;
  }
}

export interface UseAccountStateReturn {
  loading: boolean;
  state: AccountState | null;
  pendingStaffToken: string | null;
}

/**
 * React hook wrapper around resolveAccountState. Identity-tied caching so
 * we never re-resolve for the same user.id, and re-resolves cleanly when
 * the user changes.
 */
export function useAccountState(): UseAccountStateReturn {
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<UseAccountStateReturn>({
    loading: true,
    state: null,
    pendingStaffToken: null,
  });
  const resolvedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      resolvedForUserId.current = null;
      setResult({ loading: false, state: "unauthenticated", pendingStaffToken: null });
      return;
    }

    if (resolvedForUserId.current === user.id) return;

    let cancelled = false;
    setResult((prev) => ({ ...prev, loading: true }));

    resolveAccountState(user)
      .then((res) => {
        if (cancelled) return;
        resolvedForUserId.current = user.id;
        setResult({
          loading: false,
          state: res.state,
          pendingStaffToken: res.pendingStaffToken,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useAccountState] resolution error:", err);
        setResult({ loading: false, state: null, pendingStaffToken: null });
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return result;
}