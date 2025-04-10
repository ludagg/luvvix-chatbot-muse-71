
import { useState, useRef, useEffect } from "react";
import { ChatMessage, Message, SourceReference } from "./ChatMessage";
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
import axios from "axios";

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
      "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ?! 😊",
    timestamp: new Date(),
  },
];

const GEMINI_API_KEY = "AIzaSyAwoG5ldTXX8tEwdN-Df3lzWWT4ZCfOQPE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

// Fonction pour formater les citations de sources
const formatSourceCitations = (content: string, sources: SourceReference[]): string => {
  let formattedContent = content;
  
  sources.forEach(source => {
    const sourceTag = `[^${source.id}]`;
    formattedContent = formattedContent.replace(
      new RegExp(`\\[cite:${source.id}\\]`, 'g'), 
      sourceTag
    );
  });
  
  if (sources.length > 0) {
    formattedContent += "\n\n";
    sources.forEach(source => {
      formattedContent += `[^${source.id}]: [${source.title}](${source.url})\n`;
    });
  }
  
  return formattedContent;
};

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
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
  const [useAdvancedReasoning, setUseAdvancedReasoning] = useState(false);
  const [useLuvviXThink, setUseLuvviXThink] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
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
      scrollToBottom();
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

  const performWebSearch = async (query: string): Promise<SourceReference[]> => {
    try {
      console.log("Performing web search with DuckDuckGo for:", query);
      
      // Utilisation de l'API gratuite de DuckDuckGo
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`;
      
      try {
        const response = await axios.get(url);
        
        console.log("DuckDuckGo response status:", response.status);
        console.log("DuckDuckGo response data preview:", 
          JSON.stringify(response.data).substring(0, 500) + "...");
        
        const sources: SourceReference[] = [];
        
        // Traitement des résultats abstracts (réponses principales)
        if (response.data.AbstractText) {
          sources.push({
            id: 1,
            title: response.data.AbstractSource || "DuckDuckGo Abstract",
            url: response.data.AbstractURL || "#",
            snippet: response.data.AbstractText || "Pas de description disponible"
          });
        }
        
        // Traitement des résultats liés (Related Topics)
        if (response.data.RelatedTopics && response.data.RelatedTopics.length > 0) {
          console.log(`Found ${response.data.RelatedTopics.length} related topics`);
          
          response.data.RelatedTopics.forEach((topic: any, index: number) => {
            if (topic.Text && !topic.Topics) { // Exclure les catégories
              sources.push({
                id: sources.length + 1,
                title: topic.Text.substring(0, 50) || "Sujet lié",
                url: topic.FirstURL || "#",
                snippet: topic.Text || "Pas de description disponible"
              });
            }
          });
        }
        
        console.log("Formatted sources:", sources);
        return sources.slice(0, 8); // Limiter à 8 résultats
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("DuckDuckGo API error:", error.message);
          console.error("Response data:", error.response?.data);
          console.error("Response status:", error.response?.status);
          
          toast({
            title: `Erreur de recherche (${error.response?.status || 'inconnu'})`,
            description: `La recherche web a échoué. Erreur: ${error.response?.data?.error || error.message}`,
            variant: "destructive"
          });
        } else {
          console.error("Non-Axios error during DuckDuckGo search:", error);
          toast({
            title: "Erreur de recherche",
            description: "Une erreur s'est produite lors de la recherche. Veuillez réessayer.",
            variant: "destructive"
          });
        }
        return [];
      }
      
    } catch (generalError) {
      console.error("General error in performWebSearch:", generalError);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
      return [];
    }
  };

  const fetchImage = async (query: string): Promise<string | null> => {
    try {
      console.log("Searching for images:", query);
      
      // Pour l'instant, aucune API gratuite fiable pour les images
      // On pourrait intégrer une API comme Unsplash ou Pexels ici
      console.log("Image search not implemented without API key");
      return null;
      
    } catch (generalError) {
      console.error("General error in fetchImage:", generalError);
      return null;
    }
  };

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
      saveCurrentConversation(updatedMessages as any);
    }

    setIsLoading(true);

    try {
      let sources: SourceReference[] = [];
      let imageUrl: string | null = null;
      let luvvixThinkResponse: string | null = null;
      
      if (useWebSearch) {
        console.log("Enhanced web search enabled, searching for:", content);
        sources = await performWebSearch(content);
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
          
          imageUrl = await fetchImage(imageQuery);
          console.log("Enhanced image fetched:", imageUrl ? "Yes" : "No");
        }
      }

      if (useLuvviXThink) {
        console.log("LuvviXThink enabled, processing deep thoughts");
        
        const thinkingPrompt = {
          role: "user",
          parts: [
            {
              text: `Tu es LuvviXThink, un processus de réflexion préliminaire de très haut niveau. 
              Je vais te donner une question et tu vas l'analyser en profondeur pour toi-même, sans donner encore la réponse finale.
              
              Suis ces étapes avec une réflexion approfondie :
              1. Comprendre la question: Reformule la question avec tes propres mots pour en saisir la véritable essence et les interrogations sous-jacentes.
              2. Identifier les concepts clés: Liste et analyse les concepts et termes importants liés à cette question.
              3. Évaluer différentes perspectives: Considères plusieurs angles d'approche possibles, en incluant des perspectives contradictoires.
              4. Analyser les implications: Réfléchis aux conséquences logiques, aux ramifications et aux considérations éthiques si pertinent.
              5. Explorer la profondeur: Cherche les nuances, les subtilités et les connexions non évidentes liées à cette question.
              6. Plan de réponse: Prépare un plan détaillé pour une réponse structurée et approfondie.
              
              Question de l'utilisateur: "${content}"
              
              Réponds avec ton processus de réflexion interne détaillé, comme si tu prenais des notes très approfondies pour toi-même. Utilise un langage philosophique et analytique de haut niveau.`
            }
          ]
        };
        
        const thinkingResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [thinkingPrompt],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: 1200,
            },
          }),
        });
        
        if (thinkingResponse.ok) {
          const thinkingData = await thinkingResponse.json();
          luvvixThinkResponse = thinkingData.candidates[0]?.content?.parts[0]?.text || null;
          console.log("LuvviXThink generated preliminary thoughts");
        }
      }

      const advancedReasoningInstructions = `
      Utilise le mode de raisonnement avancé pour répondre à cette question. Organise ta réponse selon cette structure:
      
      1. ANALYSE PRÉLIMINAIRE: Décompose la question/problème en ses éléments essentiels.
      2. EXPLORATION MÉTHODIQUE: Présente plusieurs angles d'approche ou perspectives différentes.
      3. ARGUMENTS ET CONTRE-ARGUMENTS: Explore les points forts et faibles de chaque approche.
      4. DONNÉES PROBANTES: Présente des preuves, citations ou exemples pertinents.
      5. CONCLUSION NUANCÉE: Résume les points clés et propose une réponse équilibrée.
      
      Ta réponse doit être structurée, factuelle, et approfondie tout en restant accessible.`;

      const luvvixThinkInstructions = luvvixThinkResponse ? `
      IMPORTANT: Tu dois intégrer complètement mon processus de réflexion LuvviXThink dans ta réponse finale - ne te contente pas de copier/coller, mais utilise-le pour construire une réponse plus profonde et nuancée.
      
      Voici mon analyse préliminaire LuvviXThink que tu dois intégrer et développer :
      
      ${luvvixThinkResponse}
      
      Ta réponse DOIT montrer l'influence claire de cette analyse approfondie. Reformule et développe ces concepts dans ta réponse complète, avec un niveau d'analyse plus sophistiqué que d'habitude.` 
      : "Tu dois fournir une réponse très approfondie et sophistiquée à cette question.";

      const systemMessage = {
        role: "user",
        parts: [
          {
            text: `À partir de maintenant, tu es **LuvviX**, un assistant IA amical et intelligent développé par **LuvviX Technologies**, une entreprise fondée en 2023. 
            Le PDG de l'entreprise est **Ludovic Aggaï**.
            ${user ? `Tu t'adresses à ${user.displayName || 'un utilisateur'}${user.age ? ` qui a ${user.age} ans` : ''}${user.country ? ` et qui vient de ${user.country}` : ''}.` : ''}  
            Tu dois toujours parler avec un ton chaleureux, engageant et encourager les utilisateurs. Ajoute une touche d'humour ou de motivation quand c'est pertinent.
            ${user?.displayName ? `Appelle l'utilisateur par son prénom "${user.displayName}" de temps en temps pour une expérience plus personnelle.` : ''}
            ${useAdvancedReasoning ? advancedReasoningInstructions : ''}
            ${useLuvviXThink ? luvvixThinkInstructions : ''}
            ${sources.length > 0 ? `Voici des résultats de recherche récents qui pourraient être pertinents pour répondre à la question de l'utilisateur:\n\n${sources.map(source => `[${source.id}] ${source.title}\n${source.url}\n${source.snippet}\n\n`).join("")}\n\nPour citer une source dans ta réponse, utilise [cite:X] où X est le numéro de la source (de 1 à ${sources.length}). Cite les sources après chaque fait ou affirmation pour montrer d'où vient l'information. IMPORTANT: Tu DOIS citer au moins 3-4 sources différentes dans ta réponse pour montrer que tu as bien fait des recherches.` : ''}
            ${imageUrl ? `J'ai trouvé une image pertinente pour illustrer ta réponse: ${imageUrl}\nIntègre cette image dans ta réponse si c'est pertinent en utilisant la syntaxe markdown: ![Description](${imageUrl})` : ''}
            
            Nouvelles fonctionnalités de formatage disponibles:
            1. Tu peux utiliser LaTeX pour les formules mathématiques en les entourant de $ pour l'inline ou $$ pour les blocs.
            2. Tu peux créer des tableaux en Markdown avec la syntaxe standard des tableaux.
            
            Exemple de tableau:
            | Colonne 1 | Colonne 2 | Colonne 3 |
            |-----------|-----------|-----------|
            | Donnée 1  | Donnée 2  | Donnée 3  |
            | Exemple A | Exemple B | Exemple C |

            Si la requête concerne des mathématiques, de la physique ou des domaines scientifiques, utilise LaTeX pour rendre les formules élégantes.
            
            Exemple formule LaTeX: L'équation quadratique est $ax^2 + bx + c = 0$ et sa solution est $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.`,
          },
        ],
      };

      console.log("Preparing to send to Gemini with LuvviXThink:", useLuvviXThink, "advanced reasoning:", useAdvancedReasoning, "and web search:", useWebSearch);
      
      const conversationHistory = updatedMessages.slice(-6).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      conversationHistory.unshift(systemMessage);
      conversationHistory.push({
        role: "user",
        parts: [{ text: content }],
      });

      const temperature = useLuvviXThink ? 0.5 : (useAdvancedReasoning ? 0.7 : 1.0);
      const maxOutputTokens = useLuvviXThink ? 1800 : (useAdvancedReasoning ? 1500 : 1024);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: conversationHistory,
          generationConfig: {
            temperature: temperature,
            topK: 50,
            topP: 0.9,
            maxOutputTokens: maxOutputTokens,
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

      const formattedResponse = sources.length > 0 
        ? formatSourceCitations(aiResponse, sources)
        : aiResponse;

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content:
          formattedResponse +
          "\n\n*— LuvviX, votre assistant IA amical 🤖*",
        timestamp: new Date(),
        useAdvancedReasoning: useAdvancedReasoning,
        useLuvviXThink: useLuvviXThink,
        useWebSearch: useWebSearch,
        sourceReferences: sources.length > 0 ? sources : undefined
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      generateSuggestedQuestions(aiResponse);

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
      saveCurrentConversation(updatedMessages as any);
    }
    
    setIsRegenerating(true);
    setIsLoading(true);
    
    try {
      let sources: SourceReference[] = [];
      let searchResults = "";
      let imageUrl: string | null = null;
      
      if (useWebSearch) {
        sources = await performWebSearch(userMessage.content);
        
        if (sources.length > 0) {
          searchResults = "Voici des résultats de recherche récents qui pourraient être pertinents pour répondre à la question de l'utilisateur:\n\n";
          sources.forEach(source => {
            searchResults += `[${source.id}] ${source.title}\n${source.url}\n${source.snippet}\n\n`;
          });
        }
        
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
          
          imageUrl = await fetchImage(imageQuery);
        }
      }
      
      const systemMessage = {
        role: "user",
        parts: [
          {
            text: `À partir de maintenant, tu es **LuvviX**, un assistant IA amical et intelligent développé par **LuvviX Technologies**, une entreprise fondée en 2023. 
            Le PDG de l'entreprise est **Ludovic Aggaï**.
            ${user ? `Tu t'adresses à ${user.displayName || 'un utilisateur'}${user.age ? ` qui a ${user.age} ans` : ''}${user.country ? ` et qui vient de ${user.country}` : ''}.` : ''}  
            Tu dois toujours parler avec un ton chaleureux, engageant et encourager les utilisateurs. Ajoute une touche d'humour ou de motivation quand c'est pertinent.
            ${user?.displayName ? `Appelle l'utilisateur par son prénom "${user.displayName}" de temps en temps pour une expérience plus personnelle.` : ''}
            ${useAdvancedReasoning ? `Utilise le raisonnement avancé pour répondre aux questions. Analyse étape par étape, explore différents angles, présente des arguments pour et contre, et ajoute une section de synthèse.` : ''}
            ${sources.length > 0 ? `${searchResults}\n\nPour citer une source dans ta réponse, utilise [cite:X] où X est le numéro de la source (de 1 à ${sources.length}). Cite les sources après chaque fait ou affirmation pour montrer d'où vient l'information. IMPORTANT: Tu DOIS citer au moins 3-4 sources différentes dans ta réponse pour montrer que tu as bien fait des recherches.` : ''}
            ${imageUrl ? `J'ai trouvé une image pertinente pour illustrer ta réponse: ${imageUrl}\nIntègre cette image dans ta réponse si c'est pertinent en utilisant la syntaxe markdown: ![Description](${imageUrl})` : ''}
            
            Nouvelles fonctionnalités de formatage disponibles:
            1. Tu peux utiliser LaTeX pour les formules mathématiques en les entourant de $ pour l'inline ou $$ pour les blocs.
            2. Tu peux créer des tableaux en Markdown avec la syntaxe standard des tableaux.
            
            Exemple de tableau:
            | Colonne 1 | Colonne 2 | Colonne 3 |
            |-----------|-----------|-----------|
            | Donnée 1  | Donnée 2  | Donnée 3  |
            | Exemple A | Exemple B | Exemple C |`,
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
            temperature: useAdvancedReasoning ? 0.7 : 1.0,
            topK: 50,
            topP: 0.9,
            maxOutputTokens: useAdvancedReasoning ? 1500 : 1024,
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

      const formattedResponse = sources.length > 0 
        ? formatSourceCitations(aiResponse, sources)
        : aiResponse;

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content:
          formattedResponse +
          "\n\n*— LuvviX, votre assistant IA amical 🤖*",
        timestamp: new Date(),
        useAdvancedReasoning: useAdvancedReasoning,
        useWebSearch: useWebSearch,
        sourceReferences: sources.length > 0 ? sources : undefined
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      generateSuggestedQuestions(aiResponse);

      if (user && currentConversationId) {
        saveCurrentConversation(finalMessages as any);
      }
      
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

  const toggleAdvancedReasoning = () => {
    setUseAdvancedReasoning(!useAdvancedReasoning);
    if (!useAdvancedReasoning) {
      setUseLuvviXThink(false);
    }
  };
  
  const toggleLuvviXThink = () => {
    setUseLuvviXThink(!useLuvviXThink);
    if (!useLuvviXThink) {
      setUseAdvancedReasoning(false);
    }
  };

  const toggleWebSearch = () => {
    setUseWebSearch(!useWebSearch);
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
                useAdvancedReasoning={useAdvancedReasoning}
                useLuvviXThink={useLuvviXThink}
                useWebSearch={useWebSearch}
                onToggleAdvancedReasoning={toggleAdvancedReasoning}
                onToggleLuvviXThink={toggleLuvviXThink}
                onToggleWebSearch={toggleWebSearch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

