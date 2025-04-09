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

    // Vérification de la clé API
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

    // Log des paramètres de la requête pour débogage
    console.log("SerpAPI request parameters:", {
      q: query,
      api_key: apiKeys.serpApi ? "Key exists (hidden)" : "No key",
      engine: 'google',
      google_domain: "google.fr",
      gl: "fr",
      hl: "fr",
      num: 8
    });

    // Envoi de la requête HTTP
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

    // Traitement des résultats organiques
    if (response.data.organic_results && response.data.organic_results.length > 0) {
      console.log(`Found ${response.data.organic_results.length} organic results`);

      // Ajouter chaque résultat à la liste des sources
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
    // Gestion des erreurs générales
    if (axios.isAxiosError(error)) {
      console.error("SerpAPI Axios error:", error.message);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);

      let errorMessage = "La recherche web a échoué. ";

      // Gestion des erreurs selon le statut de la réponse
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
};

/**
 * Recherche une image via SerpAPI
 */
export const fetchImage = async (
  query: string, 
  apiKeys: ApiKeys, 
  toast: ReturnType<typeof useToast>["toast"]
): Promise<string | null> => {
  try {
    console.log("Searching for images with SerpAPI:", query);

    // Vérification de la clé API
    if (!apiKeys.serpApi) {
      console.error("SerpAPI key is missing for image search");
      toast({
        title: "Clé API manquante",
        description: "Veuillez configurer votre clé SerpAPI avec /key serp VOTRE_CLE_API",
        variant: "destructive"
      });
      return null;
    }

    const url = 'https://serpapi.com/search.json';

    // Recherche d'images via SerpAPI
    const response = await axios.get(url, {
      params: {
        q: query + " haute qualité",
        api_key: apiKeys.serpApi,
        engine: 'google_images',
        hl: 'fr',
        gl: 'fr',
        num: 5
      }
    });

    console.log("SerpAPI image search response status:", response.status);

    // Traitement des résultats d'images
    const images = response.data.images_results || [];
    if (images.length > 0) {
      console.log(`Found ${images.length} images in search results`);

      // Filtrer les images de haute qualité
      const highQualityImages = images.filter((img: any) => 
        img.original && img.original.height > 400 && img.original.width > 400
      );

      return highQualityImages.length > 0 
        ? highQualityImages[0].original.link || highQualityImages[0].link
        : (images[0].original ? images[0].original.link : images[0].link);
    }

    console.warn("No images found in SerpAPI response");
    return null;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("SerpAPI image search error:", error.message);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    } else {
      console.error("Non-Axios error during image search:", error);
    }
    return null;
  }
};