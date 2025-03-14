
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationSelector } from "./ConversationSelector";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { MessageCircleQuestion, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Toujours montrer des questions suggérées par défaut
    if (messages.length <= 1 || suggestedQuestions.length === 0) {
      const randomQuestions = [...SAMPLE_QUESTIONS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSuggestedQuestions(randomQuestions);
    }
  }, [messages.length, suggestedQuestions.length]);

  useEffect(() => {
    if (user && currentConversationId) {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (currentConv) {
        setMessages(currentConv.messages as Message[]);
        
        if (currentConv.messages.length <= 1) {
          const randomQuestions = [...SAMPLE_QUESTIONS]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          setSuggestedQuestions(randomQuestions);
        }
      } else {
        setMessages(INITIAL_MESSAGES);
        const randomQuestions = [...SAMPLE_QUESTIONS]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setSuggestedQuestions(randomQuestions);
      }
    } else if (!user) {
      setMessages(INITIAL_MESSAGES);
      const randomQuestions = [...SAMPLE_QUESTIONS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSuggestedQuestions(randomQuestions);
    }
  }, [currentConversationId, conversations, user]);

  const generateSuggestedQuestions = async (assistantResponse: string) => {
    try {
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
      
      const questionArray = suggestions.split("|").map(q => q.trim()).filter(Boolean).slice(0, 3);
      
      if (questionArray.length > 0) {
        setSuggestedQuestions(questionArray);
      } else {
        // Si on ne peut pas générer de questions, utiliser les questions par défaut
        const randomQuestions = [...SAMPLE_QUESTIONS]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setSuggestedQuestions(randomQuestions);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      // Utiliser les questions par défaut en cas d'erreur
      const randomQuestions = [...SAMPLE_QUESTIONS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSuggestedQuestions(randomQuestions);
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

      const conversationHistory = updatedMessages.slice(-6).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      conversationHistory.unshift(systemMessage);
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

      generateSuggestedQuestions(aiResponse);

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
      
      if (user && currentConversationId) {
        saveCurrentConversation(finalMessages as {
          id: string;
          role: "user" | "assistant";
          content: string;
          timestamp: Date;
        }[]);
      }
      
      // Assurer qu'il y a toujours des questions suggérées
      if (suggestedQuestions.length === 0) {
        const randomQuestions = [...SAMPLE_QUESTIONS]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setSuggestedQuestions(randomQuestions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full max-w-4xl mx-auto bg-gradient-to-b from-background/50 via-background/80 to-background rounded-xl md:rounded-2xl shadow-lg border border-primary/10 overflow-hidden">
      <div className="border-b border-border/40 p-2 px-3 md:px-4 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isMobile ? "left" : "left"} className="w-72 sm:w-80">
                <div className="pt-6">
                  <ConversationSelector closeMenu={() => setIsMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <div className="text-sm font-medium">
              {currentConversationId ? (
                conversations.find(c => c.id === currentConversationId)?.title || "Nouvelle discussion"
              ) : (
                "Nouvelle discussion"
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full relative">
        <div className="absolute top-0 left-0 right-0 h-16 md:h-24 pointer-events-none bg-gradient-to-b from-background to-transparent z-10"></div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 pb-36 scrollbar-none"
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

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/90 to-transparent pt-16 pb-4">
          <div className="px-3 md:px-6 mb-3">
            {suggestedQuestions.length > 0 && (
              <SuggestedQuestions 
                questions={suggestedQuestions} 
                onQuestionClick={handleSuggestedQuestionClick} 
              />
            )}
          </div>
          
          <div className="px-3 md:px-6">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};
