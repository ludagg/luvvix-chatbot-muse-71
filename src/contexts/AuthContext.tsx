import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/hooks/use-local-storage";

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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      let existingUser = null;
      const usersJson = localStorage.getItem("luvvix-users");
      
      if (usersJson) {
        const users = JSON.parse(usersJson);
        existingUser = users.find((u: any) => u.email === email);
        
        if (!existingUser || existingUser.password !== password) {
          throw new Error("Identifiants invalides");
        }
      } else {
        throw new Error("Aucun utilisateur trouvé");
      }
      
      const { password: _, ...userWithoutPassword } = existingUser;
      setUser(userWithoutPassword);
      
      if (email.includes("pro") || email.includes("premium")) {
        setProStatus(true);
      }
      
      const userConversations = conversations.filter(
        (conv) => conv.id.startsWith(userWithoutPassword.id)
      );
      
      if (userConversations.length > 0) {
        setCurrentConversationId(userConversations[0].id);
      } else {
        const newConvId = createNewConversation();
        setCurrentConversationId(newConvId);
      }
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string,
    age?: number,
    country?: string
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      let users = [];
      const usersJson = localStorage.getItem("luvvix-users");
      
      if (usersJson) {
        users = JSON.parse(usersJson);
        const existingUser = users.find((u: any) => u.email === email);
        
        if (existingUser) {
          throw new Error("Cet email est déjà utilisé");
        }
      }
      
      const newUser = {
        id: nanoid(),
        email,
        password,
        displayName,
        age,
        country,
        createdAt: new Date(),
      };
      
      users.push(newUser);
      localStorage.setItem("luvvix-users", JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
      if (email.includes("pro") || email.includes("premium")) {
        setProStatus(true);
      }
      
      const newConvId = createNewConversation();
      setCurrentConversationId(newConvId);
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProStatus(false);
    setCurrentConversationId(null);
  };

  const createNewConversation = () => {
    const newId = user ? `${user.id}-${nanoid()}` : nanoid();
    
    const newConversation: Conversation = {
      id: newId,
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
    setCurrentConversationId(newId);
    return newId;
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
        createNewConversation,
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
