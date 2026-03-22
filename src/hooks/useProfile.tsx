import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type ClientType = "athlete" | "artist" | null;

interface Profile {
  display_name: string | null;
  client_type: ClientType;
  avatar_url: string | null;
  phone: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, client_type, avatar_url, phone")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile({
        ...data,
        client_type: (data.client_type as ClientType) || null,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user]);

  const updateClientType = async (newType: ClientType) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ client_type: newType })
      .eq("user_id", user.id);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, client_type: newType } : prev);
    }
    return { error };
  };

  const isAthlete = profile?.client_type === "athlete";
  const isArtist = profile?.client_type === "artist";

  return { profile, loading, isAthlete, isArtist, clientType: profile?.client_type ?? null, updateClientType };
};
