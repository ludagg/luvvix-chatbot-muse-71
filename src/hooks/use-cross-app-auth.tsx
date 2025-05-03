
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

// Types for LuvviX ID user
export interface LuvviXUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

interface CrossAppAuthOptions {
  appName: 'main' | 'pharmacy' | 'streaming' | 'chat';
  autoInit?: boolean;
}

interface CrossAppAuthReturn {
  isAuthenticated: boolean;
  user: LuvviXUser | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Global event for cross app authentication
const SSO_LOGIN_EVENT = 'luvvix:auth:login';
const SSO_LOGOUT_EVENT = 'luvvix:auth:logout';
const SSO_LOCAL_STORAGE_KEY = 'luvvix-id-session';

export const useCrossAppAuth = (options: CrossAppAuthOptions): CrossAppAuthReturn => {
  const { appName, autoInit = true } = options;
  const [session, setSession] = useLocalStorage<{user: LuvviXUser, token: string} | null>(SSO_LOCAL_STORAGE_KEY, null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    if (autoInit) {
      checkExistingSession();
    }
    
    // Listen for SSO events from other apps
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SSO_LOGIN_EVENT, handleLoginEvent);
    window.addEventListener(SSO_LOGOUT_EVENT, handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SSO_LOGIN_EVENT, handleLoginEvent);
      window.removeEventListener(SSO_LOGOUT_EVENT, handleLogoutEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkExistingSession = () => {
    setLoading(true);
    try {
      // If we have a session, consider the user authenticated
      if (session) {
        // TODO: Verify token validity with an API call if needed
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking LuvviX ID session:', err);
      setError('Failed to verify authentication');
      setLoading(false);
    }
  };

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === SSO_LOCAL_STORAGE_KEY) {
      if (event.newValue) {
        try {
          const parsedSession = JSON.parse(event.newValue);
          setSession(parsedSession);
        } catch (error) {
          console.error('Error parsing session from storage event:', error);
        }
      } else {
        setSession(null);
      }
    }
  };

  const handleLoginEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{user: LuvviXUser, token: string}>;
    if (customEvent.detail) {
      setSession(customEvent.detail);
    }
  };

  const handleLogoutEvent = () => {
    setSession(null);
  };

  const login = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate SSO auth for demo
      const mockUser: LuvviXUser = {
        id: 'luvvix-' + Math.random().toString(36).substr(2, 9),
        email: 'user@luvvix.com',
        full_name: 'LuvviX User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luvvix',
        app_metadata: {
          roles: ['user'],
          app: appName
        },
        user_metadata: {
          preferences: {
            theme: 'dark'
          }
        }
      };
      
      const mockToken = 'luvvix-token-' + Date.now();
      
      // Create session
      const newSession = {
        user: mockUser,
        token: mockToken
      };
      
      // Store in localStorage
      setSession(newSession);
      
      // Broadcast login event to other apps
      window.dispatchEvent(new CustomEvent(SSO_LOGIN_EVENT, { 
        detail: newSession
      }));
      
      setLoading(false);
    } catch (err: any) {
      console.error('LuvviX ID login error:', err);
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    
    try {
      // Remove from localStorage
      setSession(null);
      
      // Broadcast logout event to other apps
      window.dispatchEvent(new Event(SSO_LOGOUT_EVENT));
      
      setLoading(false);
    } catch (err: any) {
      console.error('LuvviX ID logout error:', err);
      setError(err.message || 'Failed to logout');
      setLoading(false);
    }
  };

  return {
    isAuthenticated: !!session?.user,
    user: session?.user || null,
    login,
    logout,
    loading,
    error
  };
};
