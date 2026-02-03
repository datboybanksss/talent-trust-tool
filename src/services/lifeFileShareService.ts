import { supabase } from "@/integrations/supabase/client";

export interface LifeFileShare {
  id: string;
  owner_id: string;
  shared_with_email: string;
  shared_with_user_id: string | null;
  access_level: string;
  relationship: string;
  status: string;
  sections: string[];
  message: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LifeFileShareInsert = Omit<LifeFileShare, "id" | "created_at" | "updated_at" | "accepted_at">;

export const ACCESS_LEVELS = [
  { value: "view", label: "View Only", description: "Can view but not modify" },
  { value: "emergency", label: "Emergency Access", description: "Only visible in emergencies" },
  { value: "full", label: "Full Access", description: "Can view and download" },
] as const;

export const SHARE_RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Attorney",
  "Accountant",
  "Financial Advisor",
  "Executor",
  "Trustee",
  "Other",
] as const;

export const SHARE_SECTIONS = [
  { value: "beneficiaries", label: "Beneficiaries" },
  { value: "contacts", label: "Emergency Contacts" },
  { value: "documents", label: "Estate Documents" },
] as const;

// Fetch shares created by the user
export const fetchLifeFileShares = async (userId: string) => {
  const { data, error } = await supabase
    .from("life_file_shares")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as LifeFileShare[];
};

// Fetch shares received by the user
export const fetchReceivedShares = async (userId: string) => {
  const { data, error } = await supabase
    .from("life_file_shares")
    .select("*")
    .eq("shared_with_user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as LifeFileShare[];
};

// Create a new share
export const createLifeFileShare = async (share: Omit<LifeFileShareInsert, "shared_with_user_id">) => {
  const { data, error } = await supabase
    .from("life_file_shares")
    .insert({
      ...share,
      shared_with_user_id: null, // Will be linked when user accepts
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as LifeFileShare;
};

// Update a share
export const updateLifeFileShare = async (id: string, updates: Partial<LifeFileShareInsert>) => {
  const { data, error } = await supabase
    .from("life_file_shares")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as LifeFileShare;
};

// Delete a share
export const deleteLifeFileShare = async (id: string) => {
  const { error } = await supabase
    .from("life_file_shares")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Accept a share invitation
export const acceptLifeFileShare = async (id: string, userId: string) => {
  const { data, error } = await supabase
    .from("life_file_shares")
    .update({
      status: "accepted",
      shared_with_user_id: userId,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as LifeFileShare;
};

// Decline a share invitation
export const declineLifeFileShare = async (id: string) => {
  const { data, error } = await supabase
    .from("life_file_shares")
    .update({
      status: "declined",
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as LifeFileShare;
};

// Revoke a share
export const revokeLifeFileShare = async (id: string) => {
  const { data, error } = await supabase
    .from("life_file_shares")
    .update({
      status: "revoked",
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as LifeFileShare;
};
