import { supabase } from "@/integrations/supabase/client";
import { BeneficiaryInsert, EmergencyContactInsert, LifeFileDocumentInsert } from "@/types/lifeFile";

// Beneficiaries
export const fetchBeneficiaries = async (userId: string) => {
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createBeneficiary = async (beneficiary: BeneficiaryInsert) => {
  const { data, error } = await supabase
    .from("beneficiaries")
    .insert(beneficiary)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateBeneficiary = async (id: string, updates: Partial<BeneficiaryInsert>) => {
  const { data, error } = await supabase
    .from("beneficiaries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteBeneficiary = async (id: string) => {
  const { error } = await supabase
    .from("beneficiaries")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Emergency Contacts
export const fetchEmergencyContacts = async (userId: string) => {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("user_id", userId)
    .order("priority", { ascending: true });
  
  if (error) throw error;
  return data;
};

export const createEmergencyContact = async (contact: EmergencyContactInsert) => {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert(contact)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateEmergencyContact = async (id: string, updates: Partial<EmergencyContactInsert>) => {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteEmergencyContact = async (id: string) => {
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Life File Documents
export const fetchLifeFileDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from("life_file_documents")
    .select("*")
    .eq("user_id", userId)
    .order("document_type", { ascending: true });
  
  if (error) throw error;
  return data;
};

export const createLifeFileDocument = async (doc: LifeFileDocumentInsert) => {
  const { data, error } = await supabase
    .from("life_file_documents")
    .insert(doc)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateLifeFileDocument = async (id: string, updates: Partial<LifeFileDocumentInsert>) => {
  const { data, error } = await supabase
    .from("life_file_documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteLifeFileDocument = async (id: string) => {
  const { error } = await supabase
    .from("life_file_documents")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// File upload
export const uploadLifeFileDocument = async (userId: string, file: File) => {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("life-file-documents")
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from("life-file-documents")
    .getPublicUrl(data.path);
  
  return { path: data.path, url: urlData.publicUrl };
};

export const deleteLifeFileFromStorage = async (path: string) => {
  const { error } = await supabase.storage
    .from("life-file-documents")
    .remove([path]);
  
  if (error) throw error;
};
