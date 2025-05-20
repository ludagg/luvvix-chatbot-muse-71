
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
