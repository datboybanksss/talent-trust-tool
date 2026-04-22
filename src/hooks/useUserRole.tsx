import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type UserRole = "athlete" | "artist" | "agent" | "admin" | "staff" | "user" | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const determine = async () => {
      // Check admin first
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (isAdmin) {
        setRole("admin");
        setLoading(false);
        return;
      }

      // Check agent/manager profile
      const { data: agentProfile } = await supabase
        .from("agent_manager_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (agentProfile) {
        setRole("agent");
        setLoading(false);
        return;
      }

      // Check active staff membership (precedence: admin > agent > staff > client)
      const { data: staffRows } = await supabase
        .from("portal_staff_access")
        .select("id")
        .eq("staff_user_id", user.id)
        .eq("status", "active")
        .not("confidentiality_accepted_at", "is", null)
        .limit(1);
      if (staffRows && staffRows.length > 0) {
        setRole("staff");
        setLoading(false);
        return;
      }

      // Check client_type from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("client_type")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.client_type === "athlete") {
        setRole("athlete");
      } else if (profile?.client_type === "artist") {
        setRole("artist");
      } else {
        // Also check user_metadata from sign-up
        const meta = user.user_metadata;
        if (meta?.client_type === "athlete_agent" || meta?.client_type === "artist_manager") {
          setRole("agent");
        } else if (meta?.client_type === "athlete") {
          setRole("athlete");
        } else if (meta?.client_type === "artist") {
          setRole("artist");
        } else {
          setRole("user");
        }
      }
      setLoading(false);
    };

    determine();
  }, [user]);

  const dashboardPath = (() => {
    switch (role) {
      case "admin": return "/admin";
      case "agent": return "/agent-dashboard";
      // Staff route to /agent-dashboard (NOT /staff — dedicated staff dashboard
      // deferred pending real-PA feedback; see KNOWN_LIMITATIONS.md).
      case "staff": return "/agent-dashboard";
      default: return "/dashboard";
    }
  })();

  return { role, loading, dashboardPath };
}
