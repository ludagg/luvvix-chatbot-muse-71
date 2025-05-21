
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { nanoid } from 'nanoid';
import { toast } from '../hooks/use-toast';

// Types
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  age?: number;
  country?: string;
  isPro?: boolean;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, age: number, country: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isPro: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  createNewConversation: () => string;
  saveCurrentConversation: (messages: Message[]) => void;
  updateConversationTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Mock data for demo purposes
const DEMO_USER: User = {
  id: '1',
  email: 'demo@luvvix.com',
  displayName: 'Utilisateur',
  isPro: false
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const storedConversations = localStorage.getItem('luvvix_conversations');
      if (storedConversations) {
        const parsedConversations = JSON.parse(storedConversations);
        // Convert string dates back to Date objects
        const conversationsWithDates = parsedConversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      }

      const storedCurrentId = localStorage.getItem('luvvix_current_conversation');
      if (storedCurrentId) {
        setCurrentConversationId(storedCurrentId);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('luvvix_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save current conversation ID to localStorage whenever it changes
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('luvvix_current_conversation', currentConversationId);
    }
  }, [currentConversationId]);

  // Auth functions
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, any email/password combo works
      setUser(DEMO_USER);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur LuvviX AI",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, age: number, country: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, registration always succeeds
      setUser({
        ...DEMO_USER,
        email,
        displayName,
        age,
        country
      });
      
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur LuvviX AI",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur LuvviX AI",
    });
  };

  // Conversation management functions
  const createNewConversation = () => {
    const newId = nanoid();
    const newConversation: Conversation = {
      id: newId,
      title: "Nouvelle conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    return newId;
  };

  const saveCurrentConversation = (messages: Message[]) => {
    if (!currentConversationId) {
      // Create new conversation if none is selected
      const newId = nanoid();
      
      // Generate a title based on the first user message
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') 
        : "Nouvelle conversation";
      
      const newConversation: Conversation = {
        id: newId,
        title,
        messages,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newId);
    } else {
      // Update existing conversation
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          // Update title if it's still the default and we have a user message
          let title = conv.title;
          if (title === "Nouvelle conversation" && messages.some(m => m.role === 'user')) {
            const firstUserMessage = messages.find(m => m.role === 'user');
            if (firstUserMessage) {
              title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
            }
          }
          
          return {
            ...conv,
            messages,
            title,
            updatedAt: new Date()
          };
        }
        return conv;
      }));
    }
  };

  const updateConversationTitle = (id: string, title: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === id) {
        return { ...conv, title, updatedAt: new Date() };
      }
      return conv;
    }));
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    // If deleted the current conversation, set current to null
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      localStorage.removeItem('luvvix_current_conversation');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      isPro,
      conversations,
      currentConversationId,
      setCurrentConversationId,
      createNewConversation,
      saveCurrentConversation,
      updateConversationTitle,
      deleteConversation
    }}>
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
