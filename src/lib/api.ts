import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type ApplicationRow = Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];

/**
 * Fetch all applications, with optional filtering by service_type or current_stage.
 */
export async function getApplications(filters?: { service_type?: string; current_stage?: number }) {
  let query = supabase.from('applications').select('*').order('created_at', { ascending: false });

  if (filters?.service_type) {
    query = query.eq('service_type', filters.service_type);
  }
  
  if (filters?.current_stage !== undefined) {
    query = query.eq('current_stage', filters.current_stage);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a new application.
 * Note: folder_number must be generated using the RPC function before calling this,
 * or you can call the RPC to generate the folder_number and then insert.
 */
export async function createApplication(application: Omit<ApplicationInsert, 'folder_number'>) {
  // 1. Generate folder number for the client
  const { data: folderNumber, error: folderError } = await supabase
    .rpc('generate_folder_number', { p_client_id: application.client_id });

  if (folderError) throw folderError;

  // 2. Insert the application
  const { data, error } = await supabase
    .from('applications')
    .insert({ ...application, folder_number: folderNumber })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an application's details.
 */
export async function updateApplication(id: string, updates: ApplicationUpdate) {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Move an application to a new stage by appending to stage_updates.
 * The database trigger will automatically update the main application table.
 */
export async function advanceApplicationStage(
  applicationId: string, 
  stage: number, 
  status: string, 
  notes?: string
) {
  const { data, error } = await supabase
    .from('stage_updates')
    .insert({
      application_id: applicationId,
      stage: stage,
      status: status,
      notes: notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
