
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { authService } from '@/utils/auth-service';

// Define types for our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  setUserData: (userData: any) => void;
  createNewConversation: () => string;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  setUserData: () => {},
  createNewConversation: () => '',
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useLocalStorage('luvvix_user', null);

  useEffect(() => {
    // Initialize the auth service
    authService.initialize({
      appName: 'chat',
      redirectUrl: window.location.origin + '/oauth-callback',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
    });

    // Check if the user is already authenticated
    const checkAuth = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth && !user) {
          const profile = await authService.getUserProfile();
          if (profile) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const handleAuthChange = (isAuth: boolean) => {
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        setUser(null);
      }
    };

    authService.addAuthListener(handleAuthChange);

    return () => {
      authService.removeAuthListener(handleAuthChange);
    };
  }, [setUser]);

  // Handle login
  const login = () => {
    authService.redirectToLogin();
  };

  // Handle logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Set user data
  const setUserData = (userData: any) => {
    setUser(userData);
  };
  
  // Create a new conversation
  const createNewConversation = () => {
    // Generate a new conversation ID
    const newId = `conv_${Date.now()}`;
    return newId;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        setUserData,
        createNewConversation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
