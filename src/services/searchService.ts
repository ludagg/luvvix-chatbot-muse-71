import axios from "axios";
import { SourceReference } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";

/**
 * Effectue une recherche web via DuckDuckGo
 */
export const performWebSearch = async (
  query: string,
  toast: ReturnType<typeof useToast>["toast"]
): Promise<SourceReference[]> => {
  try {
    console.log("Performing web search with DuckDuckGo for:", query);

    const url = 'https://api.duckduckgo.com/';

    try {
      const response = await axios.get(url, {
        params: {
          q: query,
          format: 'json',
          no_redirect: 1, // Pas de redirection
          no_html: 1, // Pas de HTML dans les résultats
          skip_disambig: 1, // Ignorer les résultats de désambiguïsation
        }
      });

      console.log("DuckDuckGo response status:", response.status);
      console.log("DuckDuckGo response data preview:", JSON.stringify(response.data).substring(0, 500) + "...");

      const sources: SourceReference[] = [];

      // Récupérer les résultats liés dans 'RelatedTopics'
      if (response.data.RelatedTopics && response.data.RelatedTopics.length > 0) {
        console.log(`Found ${response.data.RelatedTopics.length} related topics`);

        response.data.RelatedTopics.forEach((item: any, index: number) => {
          sources.push({
            id: index + 1,
            title: item.Text || "Source inconnue",
            url: item.FirstURL || "#",
            snippet: item.Result || "Pas de description disponible"
          });
        });
      } else {
        console.warn("No related topics found in DuckDuckGo response");
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
        console.error("DuckDuckGo Axios error:", error.message);
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);

        let errorMessage = "La recherche web a échoué. ";

        errorMessage += `Erreur: ${error.response?.data?.error || error.message}`;

        toast({
          title: `Erreur DuckDuckGo (${error.response?.status || 'inconnu'})`,
          description: errorMessage,
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