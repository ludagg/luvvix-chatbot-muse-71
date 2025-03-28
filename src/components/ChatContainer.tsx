ùimport { useState, useRef, useEffect } from "react";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { ConversationSelector } from "./ConversationSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingActions } from "./FloatingActions";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { 
    user, 
    conversations, 
    currentConversationId, 
    saveCurrentConversation,
    createNewConversation,
    setCurrentConversation,
    isPro = false,
  } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToTop = () => {
    console.log("Scrolling to top");
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToTop();
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    
    const handleScroll = () => {
      if (!chatContainer) return;
      
     const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
     setShouldAutoScroll(isNearBottom);
    };
    
    chatContainer?.addEventListener('scroll', handleScroll);
    
    return () => {
      chatContainer?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
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
        const randomQuestions = [...SAMPLE_QUESTIONS]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setSuggestedQuestions(randomQuestions);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      const randomQuestions = [...SAMPLE_QUESTIONS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSuggestedQuestions(randomQuestions);
    }
  };

  const handleSendMessage = async (content: string) => {
    setShouldAutoScroll(true);
    
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
        "Oups ! Je n'ai pas pu générer une r��ponse. Veuillez réessayer.";

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

  const handleSendImage = async (file: File) => {
    if (!isPro) {
      toast({
        title: "Fonctionnalité Pro",
        description: "L'envoi d'images est réservé aux utilisateurs Pro. Passez à la version Pro pour débloquer cette fonctionnalité.",
        variant: "destructive"
      });
      return;
    }
    
    const imageUrl = URL.createObjectURL(file);
    const imageContent = `![Image envoyée](${imageUrl})`;
    
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: imageContent,
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
      setTimeout(() => {
        const assistantMessage: Message = {
          id: nanoid(),
          role: "assistant",
          content: "Je vois que vous avez partagé une image. Dans un environnement de production, je serais capable de l'analyser et de vous donner des informations pertinentes à son sujet.\n\n*— LuvviX AI, votre assistant IA amical 🤖*",
          timestamp: new Date(),
        };
        
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        
        if (user && currentConversationId) {
          saveCurrentConversation(finalMessages as {
            id: string;
            role: "user" | "assistant";
            content: string;
            timestamp: Date;
          }[]);
        }
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image :", error);
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async (messageId: string) => {
    if (isLoading || isRegenerating) return;
    
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex < 1) return;
    
    let lastUserMessageIndex = messageIndex - 1;
    while (lastUserMessageIndex >= 0 && messages[lastUserMessageIndex].role !== 'user') {
      lastUserMessageIndex--;
    }
    
    if (lastUserMessageIndex < 0) return;
    
    const userMessage = messages[lastUserMessageIndex];
    
    const updatedMessages = messages.slice(0, lastUserMessageIndex + 1);
    setMessages(updatedMessages);
    
    if (user && currentConversationId) {
      saveCurrentConversation(updatedMessages as {
        id: string;
        role: "user" | "assistant";
        content: string;
        timestamp: Date;
      }[]);
    }
    
    setIsRegenerating(true);
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
        parts: [{ text: userMessage.content }],
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
      
      toast({
        title: "Réponse régénérée",
        description: "Une nouvelle réponse a été générée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la régénération :", error);
      toast({
        title: "Erreur",
        description: "Impossible de régénérer la réponse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    console.log(`Feedback ${feedback} for message ${messageId}`);
    
    toast({
      title: feedback === "positive" ? "Merci pour votre retour positif!" : "Nous prenons note de votre feedback",
      description: "Votre avis nous aide à améliorer LuvviX AI.",
    });
  };

  const handleSuggestedQuestionClick = (question: string) => {
    setShouldAutoScroll(true);
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 pb-28"
      >
        <div className="space-y-4 md:space-y-6 mb-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1 && message.role === "assistant"}
              onRegenerate={handleRegenerate}
              onFeedback={handleFeedback}
            />
          ))}
          
          {messages.length > 0 && suggestedQuestions.length > 0 && (
            <div className="mt-4">
              <SuggestedQuestions 
                questions={suggestedQuestions} 
                onQuestionClick={handleSuggestedQuestionClick} 
              />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <FloatingActions scrollToTop={scrollToTop} />

      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto w-full px-2 md:px-4">
          <div className="bg-gradient-to-t from-background via-background to-background/80 pt-6 pb-4 border-t border-primary/10 backdrop-blur-sm">
            <div className="px-3 md:px-6">
              <ChatInput 
                onSendMessage={handleSendMessage}
                onSendImage={handleSendImage} 
                isLoading={isLoading}
                isPro={isPro} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
