
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Bot {
  id: string;
  name: string;
  description?: string;
  objective?: string;
  avatar_url?: string;
  user_name?: string;
  category?: string;
  views?: number;
  likes?: number;
  created_at?: string;
}

export function useRecentBots() {
  const [recentBots, setRecentBots] = useState<Bot[]>([]);
  const [popularBots, setPopularBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    setIsLoading(true);
    
    try {
      // Fetch recent bots (latest created)
      const { data: recentData, error: recentError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentError) {
        console.error('Error fetching recent bots:', recentError);
      } else {
        const formattedRecentBots = formatBots(recentData || []);
        setRecentBots(formattedRecentBots);
      }
      
      // Fetch popular bots (most views)
      const { data: popularData, error: popularError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('is_public', true)
        .order('views', { ascending: false })
        .limit(10);
      
      if (popularError) {
        console.error('Error fetching popular bots:', popularError);
      } else {
        const formattedPopularBots = formatBots(popularData || []);
        setPopularBots(formattedPopularBots);
      }
    } catch (error) {
      console.error('Unexpected error fetching bots:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format bot data
  const formatBots = (data: any[]): Bot[] => {
    return data.map(bot => ({
      id: bot.id,
      name: bot.name,
      description: bot.description || bot.objective || '',
      objective: bot.objective || '',
      avatar_url: bot.avatar_url || '',
      user_name: bot.user_name || '',
      category: bot.category || bot.avatar_style || 'general',
      views: bot.views || 0,
      likes: bot.likes || bot.views || 0,
      created_at: bot.created_at
    }));
  };

  return { recentBots, popularBots, isLoading, refetch: fetchBots };
}
