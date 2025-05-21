
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';

interface LuvvixAIAuthProviderProps {
  children: React.ReactNode;
}

export const LuvvixAIAuthProvider: React.FC<LuvvixAIAuthProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  useEffect(() => {
    // Set up auth information for LuvvixAI
    if (user) {
      localStorage.setItem('luvvix-ai-auth', JSON.stringify({
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.email?.split('@')[0] || 'User'
        }
      }));
    } else {
      localStorage.setItem('luvvix-ai-auth', JSON.stringify({
        isAuthenticated: false,
        user: null
      }));
    }
    
    // Set theme
    localStorage.setItem('theme', theme);
    
    // Apply theme to document if in iframe
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [user, theme]);
  
  return <>{children}</>;
};
