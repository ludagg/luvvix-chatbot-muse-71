
import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // User credentials storage helper functions
  const getUserCredentials = () => {
    const credentials = localStorage.getItem('luvvix_credentials');
    return credentials ? JSON.parse(credentials) : {};
  };

  const saveUserCredentials = (email: string, password: string) => {
    const credentials = getUserCredentials();
    credentials[email] = { password };
    localStorage.setItem('luvvix_credentials', JSON.stringify(credentials));
  };

  const verifyCredentials = (email: string, password: string) => {
    const credentials = getUserCredentials();
    return credentials[email] && credentials[email].password === password;
  };

  useEffect(() => {
    // Check for saved user session in localStorage
    const savedUser = localStorage.getItem('luvvix_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Verify credentials
      if (!verifyCredentials(email, password)) {
        throw new Error("Invalid credentials");
      }
      
      const savedUser = {
        id: `user_${email.split('@')[0]}`,
        email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('luvvix_user', JSON.stringify(savedUser));
      setUser(savedUser);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if user already exists
      const credentials = getUserCredentials();
      if (credentials[email]) {
        throw new Error("User already exists");
      }
      
      // Save credentials
      saveUserCredentials(email, password);
      
      // Create and save user
      const newUser = {
        id: `user_${email.split('@')[0]}`,
        email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('luvvix_user', JSON.stringify(newUser));
      setUser(newUser);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('luvvix_user');
      setUser(null);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
