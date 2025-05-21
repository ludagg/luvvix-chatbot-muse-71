
import { authService } from "@/utils/auth-service";
import { supabase } from "@/integrations/supabase/client";

// This adapter bridges between the main LuvviX authentication and the Luvvix AI chatbot
export const luvvixAIAdapter = {
  // Check if user is authenticated in the main app
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  },

  // Get current user data in the format expected by Luvvix AI
  getCurrentUser: async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      
      // Get user profile data if available
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      
      return {
        id: data.user.id,
        email: data.user.email || "",
        displayName: profileData?.full_name || data.user.email || "",
        createdAt: data.user.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Check if user has premium status
  isPremiumUser: async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return false;
      
      // You can implement your own premium check logic here
      // For example, checking a subscription table or user metadata
      
      // For now, we'll use a simple email check as in the original code
      return (
        !!data.user.email && 
        (data.user.email.includes("pro") || data.user.email.includes("premium"))
      );
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  }
};

export default luvvixAIAdapter;
