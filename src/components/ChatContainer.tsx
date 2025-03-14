
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationSelector } from "./ConversationSelector";
import { PlusCircle, MessageCircleQuestion } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample suggested questions for new conversation
const SAMPLE_QUESTIONS = [
  "Quelle est la différence entre l'intelligence artificielle et l'apprentissage automatique ?",
  "Comment puis-je améliorer ma productivité au quotidien ?",
  "Quelles sont les dernières tendances technologiques à surveiller ?",
  "Comment fonctionne la blockchain et les cryptomonnaies ?",
  "Quels sont les meilleurs livres de développement personnel à lire ?"
];

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
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
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

  // Initialize suggested questions for new conversations
  useEffect(() => {
    if (messages.length <= 1) {
      // Only show initial suggestions for new conversations
      const randomQuestions = [...SAMPLE_QUESTIONS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSuggestedQuestions(randomQuestions);
    }
  }, [messages.length]);

  // Load conversation messages when currentConversationId changes
  useEffect(() => {
    if (user && currentConversationId) {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (currentConv) {
        setMessages(currentConv.messages as Message[]);
        
        // Reset suggested questions for new conversation
        if (currentConv.messages.length <= 1) {
          const randomQuestions = [...SAMPLE_QUESTIONS]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          setSuggestedQuestions(randomQuestions);
        } else {
          setSuggestedQuestions([]);
        }
      } else {
        setMessages(INITIAL_MESSAGES);
        // Show suggestions for fresh conversations
        const randomQuestions = [...SAMPLE_QUESTIONS]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setSuggestedQuestions(randomQuestions);
      }
    } else if (!user) {
      setMessages(INITIAL_MESSAGES);
      // Show suggestions for fresh conversations
      const randomQuestions = [...SAMPLE_QUESTIONS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSuggestedQuestions(randomQuestions);
    }
  }, [currentConversationId, conversations, user]);

  // Generate context-aware suggested questions based on the latest assistant response
  const generateSuggestedQuestions = async (assistantResponse: string) => {
    try {
      // Create a prompt that asks for question suggestions based on the conversation
      const systemMessage = {
        role: "user",
        parts: [
          {
            text: `Basé sur cette réponse, génère 3 questions de suivi pertinentes que l'utilisateur pourrait poser. Renvoie uniquement les questions séparées par un pipe (|). Exemple: "Question 1?|Question 2?|Question 3?". Réponse: "${assistantResponse.substring(0, 500)}..."`,
          },
        ],
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [systemMessage],
          generationConfig: {
            temperature: 1.0,
            topK: 50,
            topP: 0.9,
            maxOutputTokens: 256,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = data.candidates[0]?.content?.parts[0]?.text || "";
      
      // Split by pipe character and take up to 3 suggestions
      const questionArray = suggestions.split("|").map(q => q.trim()).filter(Boolean).slice(0, 3);
      
      if (questionArray.length > 0) {
        setSuggestedQuestions(questionArray);
      } else {
        setSuggestedQuestions([]);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setSuggestedQuestions([]);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Clear suggested questions while processing
    setSuggestedQuestions([]);

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

      // Generate new suggested questions based on the assistant's response
      generateSuggestedQuestions(aiResponse);

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

  // Handle clicking on a suggested question
  const handleSuggestedQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full max-w-4xl mx-auto bg-gradient-to-b from-background/50 via-background/80 to-background rounded-xl md:rounded-2xl shadow-lg border border-primary/10 overflow-hidden">
      <div className="border-b border-border/40 p-2 px-3 md:px-4">
        <div className="flex items-center justify-between">
          <ConversationSelector />
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

        {/* Suggested questions */}
        {suggestedQuestions.length > 0 && !isLoading && (
          <div className="px-4 md:px-6 pb-3 pt-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageCircleQuestion className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Questions suggérées</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs border-primary/30 hover:bg-primary/10 hover:text-primary text-muted-foreground"
                  onClick={() => handleSuggestedQuestionClick(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-10 pb-3 md:pb-4 px-3 md:px-6">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
