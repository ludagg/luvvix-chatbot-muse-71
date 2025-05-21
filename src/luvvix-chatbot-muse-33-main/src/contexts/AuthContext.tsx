
import React, { createContext, useContext, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { toast } from '@/luvvix-chatbot-muse-33-main/src/hooks/use-toast';
import { useAuth as useLuvvixAuth } from '@/hooks/useAuth';

// Define user type
export interface User {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  country?: string;
  isPro?: boolean;
}

// Define conversation type
export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  isPro: boolean;
  setCurrentConversation: (id: string) => void;
  createNewConversation: () => string;
  deleteConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  saveCurrentConversation: (messages: any[]) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, age?: number, country?: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  conversations: [],
  currentConversationId: null,
  isPro: false,
  setCurrentConversation: () => {},
  createNewConversation: () => '',
  deleteConversation: async () => {},
  updateConversationTitle: async () => {},
  saveCurrentConversation: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Use the main app's auth system
  const luvvixAuth = useLuvvixAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Sync with main app auth
  useEffect(() => {
    if (luvvixAuth.user) {
      setUser({
        id: luvvixAuth.user.id,
        email: luvvixAuth.user.email || '',
        displayName: luvvixAuth.profile?.full_name || luvvixAuth.user.email?.split('@')[0] || 'User',
        isPro: false // Default to free tier
      });
    } else {
      setUser(null);
    }
    setLoading(luvvixAuth.loading);
  }, [luvvixAuth.user, luvvixAuth.profile, luvvixAuth.loading]);

  // Initialize conversations on mount or when user changes
  useEffect(() => {
    if (user) {
      // Load saved conversations from localStorage
      const savedConversations = localStorage.getItem('luvvix-ai-conversations');
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          setConversations(parsed);
          
          // Set current conversation to the most recently updated one
          if (parsed.length > 0) {
            const sorted = [...parsed].sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            setCurrentConversationId(sorted[0].id);
          }
        } catch (e) {
          console.error("Error parsing saved conversations:", e);
        }
      } else {
        // Create a default conversation if none exists
        createNewConversation();
      }
    }
  }, [user]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (user && conversations.length > 0) {
      localStorage.setItem('luvvix-ai-conversations', JSON.stringify(conversations));
    }
  }, [conversations, user]);

  // Set current conversation
  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  // Create a new conversation
  const createNewConversation = () => {
    const newId = nanoid();
    const newConversation: Conversation = {
      id: newId,
      title: "Nouvelle discussion",
      messages: [
        {
          id: "1",
          role: "assistant",
          content:
            "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ?! 😊",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    return newId;
  };

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    // Remove the conversation from the list
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    // If the deleted conversation was the current one, set the current to the first remaining one
    if (currentConversationId === id) {
      const remaining = conversations.filter(conv => conv.id !== id);
      if (remaining.length > 0) {
        setCurrentConversationId(remaining[0].id);
      } else {
        setCurrentConversationId(null);
      }
    }
  };

  // Update conversation title
  const updateConversationTitle = async (id: string, title: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, title, updatedAt: new Date() } 
          : conv
      )
    );
  };

  // Save messages to the current conversation
  const saveCurrentConversation = (messages: any[]) => {
    if (!currentConversationId || !user) return;
    
    // Extract a title from the first user message if it exists
    let title = "Nouvelle discussion";
    const firstUserMessage = messages.find(m => m.role === "user");
    if (firstUserMessage) {
      title = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "");
    }
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages, title, updatedAt: new Date() } 
          : conv
      )
    );
  };

  // Login function using LuvviX ID
  const login = async (email: string, password: string) => {
    try {
      await luvvixAuth.signIn(email, password);
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Register function using LuvviX ID
  const register = async (email: string, password: string, displayName: string, age?: number, country?: string) => {
    try {
      await luvvixAuth.signUp(email, password, { 
        full_name: displayName, 
        username: email.split('@')[0]
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await luvvixAuth.signOut();
      localStorage.removeItem('luvvix-ai-conversations');
      setConversations([]);
      setCurrentConversationId(null);
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Determine if user has pro features
  const isPro = user?.isPro || false;

  // Provide the context value
  const contextValue: AuthContextType = {
    user,
    loading,
    conversations,
    currentConversationId,
    isPro,
    setCurrentConversation,
    createNewConversation,
    deleteConversation,
    updateConversationTitle,
    saveCurrentConversation,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Standalone wrapper for the LuvvixAI module to connect to main app auth
export const LuvvixAIAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
