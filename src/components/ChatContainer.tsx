import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
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
import { formatSourceCitations } from "@/utils/formatters";
import { MathFunctionCreator } from "./MathFunctionCreator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Message } from "@/types/message";
import { SourceReference } from "@/components/ChatMessage";

const SAMPLE_QUESTIONS = [
  "Quelle est la différence entre l'intelligence artificielle et l'apprentissage automatique ?",
  "Comment puis-je améliorer ma productivité au quotidien ?",
  "Quelles sont les dernières tendances technologiques à surveiller ?",
  "Comment fonctionne la blockchain et les cryptomonnaies ?",
  "Quels sont les meilleurs livres de développement personnel à lire ?",
  "Montre-moi le graphique de la fonction sin(x)"
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
  const [showMathCreator, setShowMathCreator] = useState(false);
  
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
      
      const proxyUrl = "https://corsproxy.io/?";
      const url = `${proxyUrl}${encodeURIComponent(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1`)}`;
      
      try {
        const response = await axios.get(url);
        
        console.log("DuckDuckGo response status:", response.status);
        console.log("DuckDuckGo response data preview:", 
          JSON.stringify(response.data).substring(0, 500) + "...");
        
        const sources: SourceReference[] = [];
        
        if (response.data.AbstractText) {
          sources.push({
            id: 1,
            title: response.data.AbstractSource || "DuckDuckGo Abstract",
            url: response.data.AbstractURL || "#",
            snippet: response.data.AbstractText || "Pas de description disponible"
          });
        }
        
        if (response.data.RelatedTopics && response.data.RelatedTopics.length > 0) {
          console.log(`Found ${response.data.RelatedTopics.length} related topics`);
          
          response.data.RelatedTopics.forEach((topic: any, index: number) => {
            if (topic.Text && !topic.Topics) {
              sources.push({
                id: sources.length + 1,
                title: topic.Text.substring(0, 50) || "Sujet lié",
                url: topic.FirstURL || "#",
                snippet: topic.Text || "Pas de description disponible"
              });
            }
          });
        }
        
        if (sources.length === 0) {
          console.log("No results from DuckDuckGo, using fallback search");
          
          sources.push({
            id: 1,
            title: "Résultat de recherche 1 pour " + query,
            url: "https://example.com/result1",
            snippet: "Ceci est un exemple de résultat de recherche pour la requête: " + query
          });
          
          sources.push({
            id: 2,
            title: "Résultat de recherche 2 pour " + query,
            url: "https://example.com/result2",
            snippet: "Voici un autre exemple de résultat pour: " + query
          });
          
          sources.push({
            id: 3,
            title: "Résultat de recherche 3 pour " + query,
            url: "https://example.com/result3",
            snippet: "Et un troisième exemple pour votre requête: " + query
          });
        }
        
        console.log("Formatted sources:", sources);
        return sources.slice(0, 8);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("DuckDuckGo API error:", error.message);
          console.error("Response data:", error.response?.data);
          console.error("Response status:", error.response?.status);
          
          const fallbackSources: SourceReference[] = [
            {
              id: 1,
              title: "Résultat 1 pour " + query,
              url: "https://example.com/result1",
              snippet: "Ceci est un exemple de résultat pour: " + query
            },
            {
              id: 2,
              title: "Résultat 2 pour " + query,
              url: "https://example.com/result2",
              snippet: "Un autre exemple de résultat pour: " + query
            },
            {
              id: 3,
              title: "Résultat 3 pour " + query,
              url: "https://example.com/result3",
              snippet: "Troisième exemple pour: " + query
            }
          ];
          
          console.log("Using fallback sources due to error");
          return fallbackSources;
        } else {
          console.error("Non-Axios error during DuckDuckGo search:", error);
          
          const fallbackSources: SourceReference[] = [
            {
              id: 1,
              title: "Résultat de secours 1 pour " + query,
              url: "https://example.com/fallback1",
              snippet: "Résultat de secours pour: " + query
            },
            {
              id: 2,
              title: "Résultat de secours 2 pour " + query,
              url: "https://example.com/fallback2",
              snippet: "Autre résultat de secours pour: " + query
            }
          ];
          
          return fallbackSources;
        }
      }
      
    } catch (generalError) {
      console.error("General error in performWebSearch:", generalError);
      
      return [
        {
          id: 1,
          title: "Erreur de recherche",
          url: "#",
          snippet: "Une erreur s'est produite lors de la recherche pour: " + query
        }
      ];
    }
  };

  const fetchImage = async (query: string): Promise<string | null> => {
    try {
      console.log("Searching for images:", query);
      
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

  const checkIfMathFunctionRequested = (content: string): boolean => {
    const result = content.toLowerCase().match(/trac(e|er)|graph(e|ique)|fonction|courbe|math(s|ématique)/);
    return !!result; // Convert to boolean
  };
  
  const checkIfHasGraphSyntax = (content: string): boolean => {
    const result = content.toLowerCase().match(/((sin|cos|tan|log|exp|x\^2|\*x|\+x|x\+|x\-|\-x|x\/|\/x|sqrt)\b)|(\bf\(x\))/);
    return !!result; // Convert to boolean
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

      const mathFunctionRequested = checkIfMathFunctionRequested(content);
      const hasGraph = mathFunctionRequested && checkIfHasGraphSyntax(content);
      
      const graphParams = hasGraph ? {
        functions: [
          { fn: 'sin(x)', label: 'sin(x)', color: '#8B5CF6' },
          { fn: 'cos(x)', label: 'cos(x)', color: '#F97316' }
        ],
        xRange: [-10, 10] as [number, number],
        xLabel: 'x',
        yLabel: 'y',
        title: 'Fonctions trigonométriques'
      } : undefined;
      
      let assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content:
          formattedResponse +
          "\n\n*— LuvviX, votre assistant IA amical 🤖*",
        timestamp: new Date(),
        useAdvancedReasoning: useAdvancedReasoning,
        useLuvviXThink: useLuvviXThink,
        useWebSearch: useWebSearch,
        sourceReferences: sources.length > 0 ? sources : undefined,
        hasGraph: hasGraph,
        graphType: hasGraph ? 'function' : undefined,
        graphParams: graphParams
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

  const handleAddMathGraph = (graphMessage: Message) => {
    setMessages([...messages, graphMessage]);
    setShowMathCreator(false);
    
    if (user && currentConversationId) {
      saveCurrentConversation([...messages, graphMessage] as any);
    }
    
    setTimeout(() => {
      scrollToBottom();
    }, 100);
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

      const mathFunctionRequested = checkIfMathFunctionRequested(userMessage.content);
      const hasGraph = mathFunctionRequested && checkIfHasGraphSyntax(userMessage.content);
      
      const graphParams = hasGraph ? {
        functions: [
          { fn: 'sin(x)', label: 'sin(x)', color: '#8B5CF6' },
          { fn: 'cos(x)', label: 'cos(x)', color: '#F97316' }
        ],
        xRange: [-10, 10] as [number, number],
        xLabel: 'x',
        yLabel: 'y',
        title: 'Fonctions trigonométriques'
      } : undefined;

      let assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content:
          formattedResponse +
          "\n\n*— LuvviX, votre assistant IA amical 🤖*",
        timestamp: new Date(),
        useAdvancedReasoning: useAdvancedReasoning,
        useLuvviXThink: useLuvviXThink,
        useWebSearch: useWebSearch,
        sourceReferences: sources.length > 0 ? sources : undefined,
        hasGraph: hasGraph,
        graphType: hasGraph ? 'function' : undefined,
        graphParams: graphParams
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
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 md:hidden z-10"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <ConversationSelector
            closeMenu={() => setIsMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && (
          <div className="w-72 border-r border-border hidden md:block overflow-y-auto">
            <ConversationSelector />
          </div>
        )}
        
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto pb-32 pt-4 px-4 sm:px-6"
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              onRegenerate={message.role === "assistant" ? handleRegenerate : undefined}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-accent/10 mb-4">
              <div className="animate-pulse w-2 h-2 rounded-full bg-primary" />
              <div className="animate-pulse w-2 h-2 rounded-full bg-primary delay-150" />
              <div className="animate-pulse w-2 h-2 rounded-full bg-primary delay-300" />
              <span className="ml-2 text-sm text-muted-foreground">
                LuvviX réfléchit...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <Dialog open={showMathCreator} onOpenChange={setShowMathCreator}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un graphique</DialogTitle>
          </DialogHeader>
          <MathFunctionCreator
            onSubmit={handleAddMathGraph}
          />
        </DialogContent>
      </Dialog>
      
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background to-background/70 pt-6 pb-4">
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
          <div className="px-4 sm:px-6 mb-2">
            <SuggestedQuestions
              questions={suggestedQuestions}
              onQuestionClick={handleSendMessage}
            />
          </div>
        )}
        
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          isLoading={isLoading}
          onCreateMathGraph={() => setShowMathCreator(true)}
          useAdvancedReasoning={useAdvancedReasoning}
          useLuvviXThink={useLuvviXThink}
          useWebSearch={useWebSearch}
          onToggleAdvancedReasoning={() => setUseAdvancedReasoning(prev => !prev)}
          onToggleLuvviXThink={() => setUseLuvviXThink(prev => !prev)}
          onToggleWebSearch={() => setUseWebSearch(prev => !prev)}
        />
        
        <FloatingActions
          scrollToTop={scrollToTop}
          scrollToBottom={scrollToBottom}
          showScrollToTop={!shouldAutoScroll}
          setUseAdvancedReasoning={setUseAdvancedReasoning}
          useAdvancedReasoning={useAdvancedReasoning}
          setUseLuvviXThink={setUseLuvviXThink}
          useLuvviXThink={useLuvviXThink}
          setUseWebSearch={setUseWebSearch}
          useWebSearch={useWebSearch}
          lastMessage={messages.length > 0 ? messages[messages.length - 1] : null}
        />
      </div>
    </div>
  );
};
