import { createClient } from "@supabase/supabase-js";
import { Client } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export const getClientData = async (): Promise<Client | null> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error("Error getting user:", userError);
    return null;
  }
  
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();
  
  if (error) {
    if (error.code === "PGRST116") {
      // No client record found
      const { error: createError } = await supabase
        .from("clients")
        .insert({
          auth_user_id: user.id,
          email: user.email,
          name: user.email?.split("@")[0] || "New Client",
          active: true,
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating client:", createError);
        return null;
      }
      
      // Fetch the newly created client data
      const { data: newData, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching new client data:", fetchError);
        return null;
      }
      
      return newData;
    }
    
    console.error("Error fetching client data:", error);
    return null;
  }
  
  return data;
};

export const saveClientData = async (client: Client): Promise<boolean> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Error getting user:", userError);
    return false;
  }

  const { error } = await supabase
    .from("clients")
    .upsert({
      ...client,
      auth_user_id: user.id
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error saving client data:", error);
    return false;
  }

  return true;
};

export async function getStates(): Promise<State[]> {
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching states:', error);
    throw error;
  }

  return data || [];
}

export async function getRegions(stateId: number): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('state_id', stateId)
    .order('name');

  if (error) {
    console.error('Error fetching regions:', error);
    throw error;
  }

  return data || [];
}