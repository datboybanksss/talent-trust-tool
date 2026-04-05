import { supabase } from "@/integrations/supabase/client";
import { LifeFileAsset, LifeFileAssetInsert } from "@/types/lifeFileAsset";

export const fetchLifeFileAssets = async (userId: string): Promise<LifeFileAsset[]> => {
  const { data, error } = await supabase
    .from("life_file_assets" as any)
    .select("*")
    .eq("user_id", userId)
    .order("asset_category", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as any) || [];
};

export const createLifeFileAsset = async (asset: LifeFileAssetInsert): Promise<LifeFileAsset> => {
  const { data, error } = await supabase
    .from("life_file_assets" as any)
    .insert(asset as any)
    .select()
    .single();

  if (error) throw error;
  return data as any;
};

export const updateLifeFileAsset = async (id: string, updates: Partial<LifeFileAssetInsert>): Promise<LifeFileAsset> => {
  const { data, error } = await supabase
    .from("life_file_assets" as any)
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
};

export const deleteLifeFileAsset = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("life_file_assets" as any)
    .delete()
    .eq("id", id);

  if (error) throw error;
};
