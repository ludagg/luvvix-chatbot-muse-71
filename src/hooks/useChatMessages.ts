
import { useState, useEffect, useRef, useCallback } from "react";
import { Message, SourceReference } from "@/components/ChatMessage";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { INITIAL_MESSAGES, getRandomSuggestedQuestions } from "@/utils/messageUtils";
import { performWebSearch, fetchImage } from "@/services/searchService";
import { 
  generateSuggestedQuestions, 
  sendGeminiRequest, 
  generateLuvviXThinkAnalysis 
} from "@/services/geminiService";
import { ApiKeys, getInitialApiKeys } from "@/services/apiKeys";

interface UseChatMessagesProps {
  scrollToBottom: () => void;
}

export const useChatMessages = ({ scrollToBottom }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
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
  
  const [useAdvancedReasoning, setUseAdvancedReasoning] = useState(false);
  const [useLuvviXThink, setUseLuvviXThink] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(getInitialApiKeys());

  useEffect(() => {
    if (messages.length <= 1 || suggestedQuestions.length === 0) {
      setSuggestedQuestions(getRandomSuggestedQuestions(3));
    }
  }, [messages.length, suggestedQuestions.length]);

  useEffect(() => {
    if (user && currentConversationId) {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (currentConv) {
        setMessages(currentConv.messages as Message[]);
        
        if (currentConv.messages.length <= 1) {
          setSuggestedQuestions(getRandomSuggestedQuestions(3));
        }
      } else {
        setMessages(INITIAL_MESSAGES);
        setSuggestedQuestions(getRandomSuggestedQuestions(3));
      }
    } else if (!user) {
      setMessages(INITIAL_MESSAGES);
      setSuggestedQuestions(getRandomSuggestedQuestions(3));
    }
  }, [currentConversationId, conversations, user]);

  const handleApiKeyCommand = (content: string): boolean => {
    if (content.startsWith("/key ")) {
      const parts = content.split(" ");
      if (parts.length >= 3) {
        const service = parts[1].toLowerCase();
        const key = parts[2];
        
        if (service === "serp" || service === "serpapi") {
          setApiKeys(prev => ({ ...prev, serpApi: key }));
          toast({
            title: "Clé API mise à jour",
            description: "Votre clé SerpAPI a été mise à jour avec succès.",
          });
        } else if (service === "google" || service === "googlesearch") {
          setApiKeys(prev => ({ ...prev, googleSearch: key }));
          toast({
            title: "Clé API mise à jour",
            description: "Votre clé Google Search a été mise à jour avec succès.",
          });
        } else if (service === "bright" || service === "brightdata") {
          setApiKeys(prev => ({ ...prev, brightData: key }));
          toast({
            title: "Clé API mise à jour",
            description: "Votre clé BrightData a été mise à jour avec succès.",
          });
        }
        
        return true;
      }
    }
    return false;
  };

  const handleSendMessage = async (content: string) => {
    setShouldAutoScroll(true);
    
    if (handleApiKeyCommand(content)) {
      return;
    }
    
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    if (user && currentConversationId) {
      saveCurrentConversation(updatedMessages as any);
    }

    setIsLoading(true);

    try {
      let sources: SourceReference[] = [];
      let imageUrl: string | null = null;
      let luvvixThinkResponse: string | null = null;
      
      if (useWebSearch) {
        console.log("Enhanced web search enabled, searching for:", content);
        sources = await performWebSearch(content, apiKeys, toast);
        console.log("Enhanced search results obtained:", sources.length);

        const shouldFetchImage = content.toLowerCase().includes("montre") || 
                              content.toLowerCase().includes("image") || 
                              content.toLowerCase().includes("photo") ||
                              content.toLowerCase().includes("illustration") ||
                              content.toLowerCase().includes("afficher") ||
                              content.toLowerCase().includes("voir");
        
        if (shouldFetchImage) {
          const imageQuery = content
            .replace(/montre(-moi)?|affiche(-moi)?|image|photo|voir|illustration/gi, '')
            .trim();
          
          imageUrl = await fetchImage(imageQuery, apiKeys, toast);
          console.log("Enhanced image fetched:", imageUrl ? "Yes" : "No");
        }
      }

      if (useLuvviXThink) {
        console.log("LuvviXThink enabled, processing deep thoughts");
        luvvixThinkResponse = await generateLuvviXThinkAnalysis(content);
        console.log("LuvviXThink generated preliminary thoughts");
      }

      console.log("Preparing to send to Gemini with LuvviXThink:", useLuvviXThink, 
                  "advanced reasoning:", useAdvancedReasoning, 
                  "and web search:", useWebSearch);
      
      const { content: aiResponseContent } = await sendGeminiRequest({
        userMessage: content,
        messages: updatedMessages,
        user,
        useAdvancedReasoning,
        useLuvviXThink,
        useWebSearch,
        sources,
        imageUrl,
        luvvixThinkResponse
      });

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: aiResponseContent,
        timestamp: new Date(),
        useAdvancedReasoning,
        useLuvviXThink,
        useWebSearch,
        sourceReferences: sources.length > 0 ? sources : undefined
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      const suggestionsResult = await generateSuggestedQuestions(aiResponseContent);
      if (suggestionsResult.length > 0) {
        setSuggestedQuestions(suggestionsResult);
      } else {
        setSuggestedQuestions(getRandomSuggestedQuestions(3));
      }

      if (user && currentConversationId) {
        saveCurrentConversation(finalMessages as any);
      }
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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
        saveCurrentConversation(finalMessages as any);
      }
      
      if (suggestedQuestions.length === 0) {
        setSuggestedQuestions(getRandomSuggestedQuestions(3));
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
      saveCurrentConversation(updatedMessages as any);
    }
    
    setIsRegenerating(true);
    setIsLoading(true);
    
    try {
      let sources: SourceReference[] = [];
      let imageUrl: string | null = null;
      
      if (useWebSearch) {
        sources = await performWebSearch(userMessage.content, apiKeys, toast);
        
        const shouldFetchImage = userMessage.content.toLowerCase().includes("montre") || 
                              userMessage.content.toLowerCase().includes("image") || 
                              userMessage.content.toLowerCase().includes("photo") ||
                              userMessage.content.toLowerCase().includes("illustration") ||
                              userMessage.content.toLowerCase().includes("afficher") ||
                              userMessage.content.toLowerCase().includes("voir");
        
        if (shouldFetchImage) {
          const imageQuery = userMessage.content
            .replace(/montre(-moi)?|affiche(-moi)?|image|photo|voir|illustration/gi, '')
            .trim();
          
          imageUrl = await fetchImage(imageQuery, apiKeys, toast);
        }
      }
      
      const { content: aiResponseContent } = await sendGeminiRequest({
        userMessage: userMessage.content,
        messages: updatedMessages,
        user,
        useAdvancedReasoning,
        useLuvviXThink: false,
        useWebSearch,
        sources,
        imageUrl,
        luvvixThinkResponse: null
      });

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: aiResponseContent,
        timestamp: new Date(),
        useAdvancedReasoning,
        useWebSearch,
        sourceReferences: sources.length > 0 ? sources : undefined
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      const suggestionsResult = await generateSuggestedQuestions(aiResponseContent);
      if (suggestionsResult.length > 0) {
        setSuggestedQuestions(suggestionsResult);
      } else {
        setSuggestedQuestions(getRandomSuggestedQuestions(3));
      }

      if (user && currentConversationId) {
        saveCurrentConversation(finalMessages as any);
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

  return {
    messages,
    isLoading,
    suggestedQuestions,
    useAdvancedReasoning,
    useLuvviXThink,
    useWebSearch,
    shouldAutoScroll,
    setShouldAutoScroll,
    setUseAdvancedReasoning,
    setUseLuvviXThink,
    setUseWebSearch,
    handleSendMessage,
    handleSendImage,
    handleRegenerate,
    handleFeedback,
    handleSuggestedQuestionClick,
    apiKeys,
    setApiKeys
  };
};
