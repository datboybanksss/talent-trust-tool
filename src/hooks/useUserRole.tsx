import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { resolveAccountState, type AccountState } from "@/lib/accountState";

export type UserRole = "athlete" | "artist" | "agent" | "admin" | "staff" | "revoked_staff" | "user" | null;

const ROLE_RESOLUTION_TIMEOUT_MS = 5000;

function stateToRole(state: AccountState): UserRole {
  switch (state) {
    case "admin": return "admin";
    case "agent": return "agent";
    case "staff": return "staff";
    case "athlete": return "athlete";
    case "artist": return "artist";
    case "revoked_staff": return "revoked_staff";
    default: return "user";
  }
}

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [resolvedForUserId, setResolvedForUserId] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [errored, setErrored] = useState(false);
  // Tracks whether we have EVER successfully resolved a role for the current
  // user.id. Used to differentiate first-load timeout (sign user out) from a
  // mid-session re-resolution timeout (warn + keep cached role).
  const hasEverResolvedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setResolvedForUserId(null);
      setTimedOut(false);
      setErrored(false);
      hasEverResolvedRef.current = false;
      lastUserIdRef.current = null;
      return;
    }

    const currentUserId = user.id;
    let cancelled = false;

    // On user identity change: clear cached role & reset the "ever resolved"
    // flag so a fresh first-load timeout can sign out if needed.
    if (lastUserIdRef.current !== currentUserId) {
      hasEverResolvedRef.current = false;
      setRole(null);
      setResolvedForUserId(null);
      setTimedOut(false);
      setErrored(false);
      lastUserIdRef.current = currentUserId;
    }

    const timeoutHandle = window.setTimeout(() => {
      if (cancelled) return;
      if (hasEverResolvedRef.current) {
        // Mid-session re-resolution hang: keep the last-known-good role,
        // do NOT sign the user out.
        console.warn(
          "[useUserRole] Role re-resolution timeout — falling back to cached role",
          currentUserId,
        );
        return;
      }
      console.error(
        "[useUserRole] Role resolution timeout for user",
        currentUserId,
      );
      setTimedOut(true);
    }, ROLE_RESOLUTION_TIMEOUT_MS);

    const commit = (resolved: UserRole) => {
      if (cancelled || lastUserIdRef.current !== currentUserId) return;
      setRole(resolved);
      setResolvedForUserId(currentUserId);
      hasEverResolvedRef.current = true;
    };

    const determine = async () => {
      const resolved = await resolveAccountState(user);
      if (cancelled || lastUserIdRef.current !== currentUserId) return;
      if (resolved.state === "query_error") {
        hasEverResolvedRef.current = true; // prevent timeout from signing out
        setErrored(true);
        setResolvedForUserId(currentUserId);
        return;
      }
      commit(stateToRole(resolved.state));
    };

    determine().catch((err) => {
      if (!cancelled) console.error("[useUserRole] resolution error", err);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutHandle);
    };
  }, [user]);

  // First-load timeout side-effect: sign out + redirect with a referenced
  // toast. Mid-session timeouts never reach this branch (timedOut stays false).
  useEffect(() => {
    if (!timedOut) return;
    toast.error("We couldn't determine your account type. Please sign in again.", {
      description: "Reference: role-resolution-timeout",
      duration: 8000,
    });
    supabase.auth.signOut().finally(() => {
      window.location.replace("/auth");
    });
  }, [timedOut]);

  // Identity-tied loading: true whenever a signed-in user's role hasn't been
  // resolved for THAT specific user.id yet. Eliminates the one-render stale
  // `null` window that previously routed staff to `/dashboard`.
  const loading = !!user && resolvedForUserId !== user.id && !timedOut;

  // Nullable while loading so consumers cannot read a stale default route.
  const dashboardPath: string | null = (() => {
    if (loading || errored) return null;
    switch (role) {
      case "admin": return "/admin";
      case "agent": return "/agent-dashboard";
      // Staff route to /agent-dashboard (see KNOWN_LIMITATIONS.md).
      case "staff": return "/agent-dashboard";
      case "revoked_staff": return "/revoked";
      default: return "/dashboard";
    }
  })();

  return { role, loading, dashboardPath, timedOut, errored };
}
