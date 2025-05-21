
import { ReactNode, useEffect, useState } from "react";
import { AuthProvider as LuvvixAIAuthContext } from "@/luvvix-chatbot-muse-33-main/src/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";

interface LuvvixAIAuthProviderProps {
  children: ReactNode;
}

export const LuvvixAIAuthProvider = ({ children }: LuvvixAIAuthProviderProps) => {
  const { user, profile } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (user) {
      // Synchronize main app auth with Luvvix AI auth
      setIsAuthenticated(true);
      
      // Store user data in the format expected by Luvvix AI
      const luvvixAIUser = {
        id: user.id,
        email: user.email || "",
        displayName: profile?.full_name || user.email || "",
        createdAt: new Date(),
      };
      
      // Store in localStorage in the format expected by the chatbot
      localStorage.setItem("luvvix-user", JSON.stringify(luvvixAIUser));
      
      // Set pro status if user has certain email domains
      const isPro = user.email?.includes("pro") || user.email?.includes("premium") || false;
      localStorage.setItem("luvvix-pro-status", JSON.stringify(isPro));
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem("luvvix-user");
    }
  }, [user, profile]);

  // Custom authentication adapter to bridge between main app auth and Luvvix AI
  const authAdapter = {
    // Instead of implementing actual auth methods, we'll use the main app's auth
    // and just simulate success/failure for the chatbot module
    login: async (email: string, password: string) => {
      if (isAuthenticated) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Please login through the main app"));
    },
    register: async (email: string, password: string) => {
      if (isAuthenticated) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Please register through the main app"));
    },
    logout: async () => {
      // We don't actually logout from the main app here
      // Just simulate for the chatbot UI
      return Promise.resolve();
    }
  };

  return <LuvvixAIAuthContext>{children}</LuvvixAIAuthContext>;
};
