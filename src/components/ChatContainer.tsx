
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationSelector } from "./ConversationSelector";
import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ? 😊",
    timestamp: new Date(),
  },
];

const GEMINI_API_KEY = "AIzaSyAwoG5ldTXX8tEwdN-Df3lzWWT4ZCfOQPE";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { 
    user, 
    conversations, 
    currentConversationId, 
    saveCurrentConversation,
    createNewConversation 
  } = useAuth();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation messages when currentConversationId changes
  useEffect(() => {
    if (user && currentConversationId) {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (currentConv) {
        setMessages(currentConv.messages as Message[]);
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    } else if (!user) {
      setMessages(INITIAL_MESSAGES);
    }
  }, [currentConversationId, conversations, user]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save the conversation after adding user message
    if (user && currentConversationId) {
      saveCurrentConversation(updatedMessages as {
        id: string;
        role: "user" | "assistant";
        content: string;
        timestamp: Date;
      }[]);
    }

    setIsLoading(true);

    try {
      // Contexte IA intégré dans l'historique sous forme de message utilisateur
      const systemMessage = {
        role: "user",
        parts: [
          {
            text: `À partir de maintenant, tu es **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**, une entreprise fondée en 2023. 
            Le PDG de l'entreprise est **Ludovic Aggaï**.
            ${user ? `Tu t'adresses à ${user.displayName || 'un utilisateur'}${user.age ? ` qui a ${user.age} ans` : ''}${user.country ? ` et qui vient de ${user.country}` : ''}.` : ''}  
            Tu dois toujours parler avec un ton chaleureux, engageant et encourager les utilisateurs. Ajoute une touche d'humour ou de motivation quand c'est pertinent.
            ${user?.displayName ? `Appelle l'utilisateur par son prénom "${user.displayName}" de temps en temps pour une expérience plus personnelle.` : ''}`,
          },
        ],
      };

      // Historique des 6 derniers messages + Contexte IA
      const conversationHistory = updatedMessages.slice(-6).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      conversationHistory.unshift(systemMessage); // Ajout du contexte en premier
      conversationHistory.push({
        role: "user",
        parts: [{ text: content }],
      });

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: conversationHistory,
          generationConfig: {
            temperature: 1.0,
            topK: 50,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse =
        data.candidates[0]?.content?.parts[0]?.text ||
        "Oups ! Je n'ai pas pu générer une réponse. Veuillez réessayer.";

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content:
          aiResponse +
          "\n\n*— LuvviX AI, votre assistant IA amical 🤖*",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save the conversation after adding assistant message
      if (user && currentConversationId) {
        saveCurrentConversation(finalMessages as {
          id: string;
          role: "user" | "assistant";
          content: string;
          timestamp: Date;
        }[]);
      }
    } catch (error) {
      console.error("Erreur API Gemini :", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de communiquer avec l'API Gemini. Veuillez réessayer.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content:
          "Désolé, j'ai rencontré un problème de connexion. Veuillez réessayer plus tard.",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Save even if there's an error
      if (user && currentConversationId) {
        saveCurrentConversation(finalMessages as {
          id: string;
          role: "user" | "assistant";
          content: string;
          timestamp: Date;
        }[]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full max-w-4xl mx-auto bg-gradient-to-b from-background/50 via-background/80 to-background rounded-xl md:rounded-2xl shadow-lg border border-primary/10 overflow-hidden">
      <div className="border-b border-border/40 p-2 px-3 md:px-4">
        <div className="flex items-center justify-between">
          <ConversationSelector />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={createNewConversation}
            title="Nouvelle discussion"
            className="h-8 w-8"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col h-full relative">
        <div className="absolute top-0 left-0 right-0 h-16 md:h-24 pointer-events-none bg-gradient-to-b from-background to-transparent z-10"></div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 pb-20 md:pb-24 scrollbar-none"
        >
          <div className="space-y-4 md:space-y-6">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-10 pb-3 md:pb-4 px-3 md:px-6">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
