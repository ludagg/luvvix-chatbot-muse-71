
import axios from "axios";
import { Message } from "@/components/ChatMessage";
import { API_URLS, DEFAULT_KEYS } from "./apiKeys";
import { formatSourceCitations } from "@/utils/messageUtils";
import { nanoid } from "nanoid";
import { SourceReference } from "@/components/ChatMessage";

/**
 * Génère des suggestions de questions basées sur la réponse de l'assistant
 */
export const generateSuggestedQuestions = async (assistantResponse: string): Promise<string[]> => {
  try {
    const systemMessage = {
      role: "user",
      parts: [
        {
          text: `Basé sur cette réponse, génère 3 questions de suivi pertinentes que l'utilisateur pourrait poser. Renvoie uniquement les questions séparées par un pipe (|). Exemple: "Question 1?|Question 2?|Question 3?". Réponse: "${assistantResponse.substring(0, 500)}..."`,
        },
      ],
    };

    const response = await fetch(`${API_URLS.GEMINI_API_URL}?key=${DEFAULT_KEYS.GEMINI_API_KEY}`, {
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
    
    return suggestions.split("|").map((q: string) => q.trim()).filter(Boolean).slice(0, 3);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
};

interface GeminiRequestOptions {
  userMessage: string;
  messages: Message[];
  user: any;
  useAdvancedReasoning: boolean;
  useLuvviXThink: boolean;
  useWebSearch: boolean;
  sources: SourceReference[];
  imageUrl: string | null;
  luvvixThinkResponse: string | null;
}

/**
 * Envoie une requête à l'API Gemini et traite la réponse
 */
export const sendGeminiRequest = async (
  options: GeminiRequestOptions
): Promise<{ content: string; sources: SourceReference[] }> => {
  const {
    userMessage,
    messages,
    user,
    useAdvancedReasoning,
    useLuvviXThink,
    useWebSearch,
    sources,
    imageUrl,
    luvvixThinkResponse
  } = options;

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

  const conversationHistory = messages.slice(-6).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  conversationHistory.unshift(systemMessage);
  conversationHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const temperature = useLuvviXThink ? 0.5 : (useAdvancedReasoning ? 0.7 : 1.0);
  const maxOutputTokens = useLuvviXThink ? 1800 : (useAdvancedReasoning ? 1500 : 1024);

  const response = await fetch(`${API_URLS.GEMINI_API_URL}?key=${DEFAULT_KEYS.GEMINI_API_KEY}`, {
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

  return { 
    content: formattedResponse + "\n\n*— LuvviX, votre assistant IA amical 🤖*",
    sources
  };
};

/**
 * Génère une analyse préliminaire avec LuvviXThink
 */
export const generateLuvviXThinkAnalysis = async (content: string): Promise<string | null> => {
  try {
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
    
    const thinkingResponse = await fetch(`${API_URLS.GEMINI_API_URL}?key=${DEFAULT_KEYS.GEMINI_API_KEY}`, {
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
      return thinkingData.candidates[0]?.content?.parts[0]?.text || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error generating LuvviXThink analysis:", error);
    return null;
  }
};
