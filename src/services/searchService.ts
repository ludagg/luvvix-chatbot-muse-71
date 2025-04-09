import axios from "axios";
import { SourceReference } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { ApiKeys } from "./apiKeys";

/**
 * Effectue une recherche web via SerpAPI
 */
export const performWebSearch = async (
  query: string, 
  apiKeys: ApiKeys, 
  toast: ReturnType<typeof useToast>["toast"]
): Promise<SourceReference[]> => {
  try {
    console.log("Performing web search with SerpAPI for:", query);

    if (!apiKeys.serpApi) {
      console.error("SerpAPI key is missing");
      toast({
        title: "Clé API manquante",
        description: "Veuillez configurer votre clé SerpAPI avec /key serp VOTRE_CLE_API",
        variant: "destructive"
      });
      return [];
    }

    const url = 'https://serpapi.com/search.json';

    try {
      const response = await axios.get(url, {
        params: {
          q: query,
          api_key: apiKeys.serpApi,
          engine: 'google',
          google_domain: "google.fr",
          gl: "fr",  // Pays : France
          hl: "fr",  // Langue : français
          num: 8     // Nombre de résultats
        }
      });

      console.log("SerpAPI response status:", response.status);
      console.log("SerpAPI response data preview:", 
        JSON.stringify(response.data).substring(0, 500) + "...");

      const sources: SourceReference[] = [];

      if (response.data.organic_results && response.data.organic_results.length > 0) {
        console.log(`Found ${response.data.organic_results.length} organic results`);

        response.data.organic_results.forEach((result: any, index: number) => {
          sources.push({
            id: index + 1,
            title: result.title || "Source inconnue",
            url: result.link || "#",
            snippet: result.snippet || "Pas de description disponible"
          });
        });
      } else {
        console.warn("No organic results found in SerpAPI response");
        toast({
          title: "Aucun résultat",
          description: "La recherche n'a retourné aucun résultat pertinent.",
          variant: "default"
        });
      }

      console.log("Formatted sources:", sources);
      return sources;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("SerpAPI Axios error:", error.message);
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);

        let errorMessage = "La recherche web a échoué. ";

        if (error.response?.status === 401) {
          errorMessage += "Votre clé API SerpAPI est invalide ou a expiré.";
        } else if (error.response?.status === 429) {
          errorMessage += "Vous avez atteint votre limite de requêtes SerpAPI.";
        } else {
          errorMessage += `Erreur: ${error.response?.data?.error || error.message}`;
        }

        toast({
          title: `Erreur SerpAPI (${error.response?.status || 'inconnu'})`,
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.error("Non-Axios error during SerpAPI search:", error);
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