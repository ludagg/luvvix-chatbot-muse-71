
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "@/components/ui/use-toast";
import { LuvviXID } from "@/utils/luvvix-id-sdk";

export interface User {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  country?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }[];
}

export interface AuthContextType {
  user: User | null;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string, age?: number, country?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => string;
  saveCurrentConversation: (messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }[]) => void;
  setCurrentConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  clearConversations: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>("luvvix-user", null);
  const [proStatus, setProStatus] = useLocalStorage<boolean>("luvvix-pro-status", false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    "luvvix-conversations",
    []
  );
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>(
    "luvvix-current-conversation-id",
    null
  );
  const [luvvixIdClient, setLuvvixIdClient] = useState<LuvviXID | null>(null);

  // Initialize LuvviX ID client
  useEffect(() => {
    try {
      const client = new LuvviXID({
        appName: 'chat',
        redirectUrl: window.location.origin,
        cookieDomain: '.luvvix.it.com'
      });
      setLuvvixIdClient(client);
      
      // Check if user is already authenticated with LuvviX ID
      const checkAuth = async () => {
        try {
          const isAuthenticated = await client.checkSilentAuth();
          if (isAuthenticated) {
            const userData = await client.getUserProfile();
            if (userData) {
              // Convert LuvviX ID user data to app user format
              const appUser: User = {
                id: userData.id || nanoid(),
                email: userData.email || '',
                displayName: userData.full_name || userData.username || '',
              };
              setUser(appUser);
              
              // Set pro status based on subscription or email domain
              const hasPro = userData.is_pro || !!userData.subscriptions?.length || userData.email?.includes('pro');
              setProStatus(hasPro);
              
              // Load user conversations
              const userConversations = conversations.filter(
                (conv) => conv.id.startsWith(appUser.id)
              );
              
              if (userConversations.length > 0) {
                setCurrentConversationId(userConversations[0].id);
              } else {
                // Create a new conversation for this user if none exists
                const newConvId = createNewConversation(appUser.id);
                setCurrentConversationId(newConvId);
              }
            }
          }
        } catch (err) {
          console.error("Error checking authentication:", err);
        }
      };
      
      checkAuth();
    } catch (error) {
      console.error("Error initializing LuvviX ID client:", error);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!luvvixIdClient) {
      throw new Error("LuvviX ID client not initialized");
    }
    
    setIsLoading(true);
    try {
      // Redirect to LuvviX ID login page
      luvvixIdClient.redirectToLogin();
      // The redirect will happen, so we don't need to do anything else here
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Erreur lors de la connexion",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
      throw new Error(error.message || "Erreur lors de la connexion");
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string,
    age?: number,
    country?: string
  ) => {
    if (!luvvixIdClient) {
      throw new Error("LuvviX ID client not initialized");
    }
    
    setIsLoading(true);
    try {
      // Redirect to LuvviX ID signup page
      luvvixIdClient.redirectToLogin({ signup: true });
      // The redirect will happen, so we don't need to do anything else here
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
      throw new Error(error.message || "Erreur lors de l'inscription");
    }
  };

  const logout = () => {
    if (luvvixIdClient) {
      luvvixIdClient.logout();
    }
    setUser(null);
    setProStatus(false);
    setCurrentConversationId(null);
  };

  // Handle OAuth callback from LuvviX ID
  useEffect(() => {
    const handleCallback = async () => {
      if (!luvvixIdClient || !window.location.search.includes('token=')) {
        return;
      }
      
      setIsLoading(true);
      try {
        const result = await luvvixIdClient.handleCallback();
        if (result.success && result.user) {
          const appUser: User = {
            id: result.user.id || nanoid(),
            email: result.user.email || '',
            displayName: result.user.full_name || result.user.username || '',
          };
          setUser(appUser);
          
          // Set pro status based on subscription or email domain
          const hasPro = result.user.is_pro || !!result.user.subscriptions?.length || appUser.email.includes('pro');
          setProStatus(hasPro);
          
          // Load or create a conversation for the user
          const userConversations = conversations.filter(
            (conv) => conv.id.startsWith(appUser.id)
          );
          
          if (userConversations.length > 0) {
            setCurrentConversationId(userConversations[0].id);
          } else {
            const newConvId = createNewConversation(appUser.id);
            setCurrentConversationId(newConvId);
          }
          
          toast({
            title: "Connexion réussie",
            description: `Bienvenue sur LuvviX AI, ${appUser.displayName || ''}!`,
          });
          
          // Clear the URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error: any) {
        console.error("Error handling callback:", error);
        toast({
          title: "Erreur d'authentification",
          description: error.message || "Une erreur est survenue",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    handleCallback();
  }, [luvvixIdClient]);

  const createNewConversation = (userId?: string) => {
    const newId = userId || (user ? user.id : nanoid());
    const conversationId = `${newId}-${nanoid()}`;
    
    const newConversation: Conversation = {
      id: conversationId,
      title: `Nouvelle conversation ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: "1",
          role: "assistant",
          content:
            "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ? 😊",
          timestamp: new Date(),
        },
      ],
    };
    
    setConversations([newConversation, ...conversations]);
    return conversationId;
  };

  const saveCurrentConversation = (
    messages: {
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
    }[]
  ) => {
    if (!currentConversationId) return;
    
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === currentConversationId) {
        let title = conv.title;
        if (messages.length > 1 && conv.messages.length <= 1) {
          const firstUserMessage = messages.find((m) => m.role === "user");
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "");
          }
        }
        
        return {
          ...conv,
          title,
          messages,
          updatedAt: new Date(),
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
  };

  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(updatedConversations);
    
    if (currentConversationId === id) {
      if (updatedConversations.length > 0) {
        setCurrentConversationId(updatedConversations[0].id);
      } else {
        setCurrentConversationId(null);
      }
    }
  };

  const renameConversation = (id: string, title: string) => {
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === id) {
        return {
          ...conv,
          title,
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
  };

  const updateConversationTitle = (id: string, title: string) => {
    renameConversation(id, title);
  };

  const clearConversations = () => {
    setConversations([]);
    setCurrentConversationId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isPro: proStatus,
        login,
        register,
        logout,
        isLoading,
        conversations,
        currentConversationId,
        createNewConversation: () => createNewConversation(),
        saveCurrentConversation,
        setCurrentConversation,
        deleteConversation,
        renameConversation,
        updateConversationTitle,
        clearConversations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
