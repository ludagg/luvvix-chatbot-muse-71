
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallback values for preview environments
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qlhovvqcwjdbirmekdoy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const incrementAgentViews = async ({ agentId }: { agentId: string }) => {
  try {
    const { error } = await supabase.rpc('increment_agent_views', {
      agent_id: agentId
    });
    
    if (error) {
      console.error('Error incrementing views:', error);
    }
  } catch (err) {
    console.error('Error calling increment_agent_views:', err);
  }
};
