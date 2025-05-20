
import { supabase } from "@/integrations/supabase/client";

export interface Agent {
  id: string;
  name: string;
  avatar_style: string;
  objective: string;
  personality: string;
  is_public: boolean;
  is_paid: boolean;
  price: number;
  views: number;
  rating: number;
  created_at: string;
  updated_at: string;
  slug: string;
  user_id: string;
  user?: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
  reviews_count?: number;
  conversations_count?: number;
}

interface AgentFilter {
  category?: string;
  sortBy?: string;
  searchQuery?: string;
}

export async function incrementAgentViews({ agentId }: { agentId: string }): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_agent_views', {
      agent_id: agentId
    });
    
    if (error) {
      console.error('Error incrementing views:', error);
    }
  } catch (error) {
    console.error('Error calling increment_agent_views:', error);
  }
}

class AIAgentService {
  async getAgents(filters: AgentFilter = {}): Promise<Agent[]> {
    try {
      let query = supabase
        .from("ai_agents")
        .select(`
          *,
          user_profiles:user_id(full_name, avatar_url, username)
        `)
        .eq("is_public", true);

      // Apply sorting
      switch (filters.sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("views", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("views", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the results to match our Agent type
      const formattedAgents: Agent[] = data.map((agent: any) => ({
        ...agent,
        user: agent.user_profiles,
        // Add some approximate stats based on views
        reviews_count: Math.max(1, Math.floor(agent.views / 10)),
        conversations_count: Math.max(5, Math.floor(agent.views * 2)),
      }));

      // Apply search filter in memory if needed
      if (filters.searchQuery) {
        return formattedAgents.filter(agent =>
          agent.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
          agent.objective.toLowerCase().includes(filters.searchQuery!.toLowerCase())
        );
      }

      return formattedAgents;
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  }

  async getFavoriteAgents(userId: string): Promise<Agent[]> {
    try {
      const { data: favorites, error: favError } = await supabase
        .from("ai_favorites")
        .select("agent_id")
        .eq("user_id", userId);

      if (favError) throw favError;
      
      const favoriteIds = favorites.map(fav => fav.agent_id);
      
      if (favoriteIds.length === 0) {
        return [];
      }
      
      const { data, error } = await supabase
        .from("ai_agents")
        .select(`
          *,
          user_profiles:user_id(full_name, avatar_url, username)
        `)
        .in("id", favoriteIds);

      if (error) throw error;

      return data.map((agent: any) => ({
        ...agent,
        user: agent.user_profiles,
        reviews_count: Math.max(1, Math.floor(agent.views / 10)),
        conversations_count: Math.max(5, Math.floor(agent.views * 2)),
      }));
    } catch (error) {
      console.error("Error fetching favorite agents:", error);
      return [];
    }
  }

  async getTrendingCreators(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          ai_agents:user_id(id)
        `)
        .not('ai_agents', 'is', null)
        .limit(4);

      if (error) throw error;

      return data.map((creator: any) => ({
        id: creator.id,
        name: creator.full_name || creator.username || "Créateur anonyme",
        avatarUrl: creator.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${creator.id}`,
        agentsCount: creator.ai_agents ? creator.ai_agents.length : 0,
        followerCount: Math.floor(Math.random() * 2000 + 100), // Simulated for now
        isVerified: Math.random() > 0.5, // Randomized for demonstration
        bio: "Créateur d'agents IA sur LuvviX", // Default bio
      }));
    } catch (error) {
      console.error("Error fetching trending creators:", error);
      return [];
    }
  }

  async toggleFavorite(userId: string, agentId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("ai_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("agent_id", agentId)
        .single();

      if (data) {
        // Remove from favorites
        const { error } = await supabase
          .from("ai_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("agent_id", agentId);

        if (error) throw error;
        return false;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("ai_favorites")
          .insert({
            user_id: userId,
            agent_id: agentId,
            added_at: new Date().toISOString()
          });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }

  async toggleFollowCreator(followerId: string, creatorId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("ai_follows")
        .select("id")
        .eq("follower_id", followerId)
        .eq("creator_id", creatorId)
        .single();

      if (data) {
        // Unfollow
        const { error } = await supabase
          .from("ai_follows")
          .delete()
          .eq("follower_id", followerId)
          .eq("creator_id", creatorId);

        if (error) throw error;
        return false;
      } else {
        // Follow
        const { error } = await supabase
          .from("ai_follows")
          .insert({
            follower_id: followerId,
            creator_id: creatorId,
            followed_at: new Date().toISOString()
          });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      throw error;
    }
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("ai_favorites")
        .select("agent_id")
        .eq("user_id", userId);

      if (error) throw error;
      return data.map(fav => fav.agent_id);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      return [];
    }
  }

  async getUserFollowing(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("ai_follows")
        .select("creator_id")
        .eq("follower_id", userId);

      if (error) throw error;
      return data.map(follow => follow.creator_id);
    } catch (error) {
      console.error("Error fetching followed creators:", error);
      return [];
    }
  }

  // Function to directly increment agent views
  async recordAgentView(agentId: string): Promise<void> {
    try {
      await incrementAgentViews({ agentId });
    } catch (error) {
      console.error("Error recording agent view:", error);
    }
  }
  
  // New method to get a single agent by ID with proper error handling
  async getAgentById(agentId: string): Promise<Agent | null> {
    try {
      // First fetch the agent data
      const { data: agentData, error: agentError } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("id", agentId)
        .single();
      
      if (agentError || !agentData) {
        console.error("Error fetching agent:", agentError);
        return null;
      }
      
      // Then fetch the user profile data separately
      let userData = null;
      if (agentData.user_id) {
        const { data: userProfileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", agentData.user_id)
          .single();
        
        if (userProfileData) {
          userData = userProfileData;
        }
      }
      
      // Combine the data
      return {
        ...agentData,
        user: userData ? {
          full_name: userData.full_name || '',
          avatar_url: userData.avatar_url || '',
          username: userData.username || ''
        } : undefined,
        reviews_count: Math.max(1, Math.floor(agentData.views / 10)),
        conversations_count: Math.max(5, Math.floor(agentData.views * 2)),
      };
    } catch (error) {
      console.error("Error in getAgentById:", error);
      return null;
    }
  }
}

export default new AIAgentService();
