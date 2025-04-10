
import { useState } from 'react';
import { SourceReference } from "@/components/ChatMessage";
import { performWebSearch, fetchImage } from '@/services/searchService';
import { useToast } from "@/hooks/use-toast";

/**
 * Hook pour gérer la recherche web et la récupération d'images
 */
export const useWebSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  /**
   * Effectue une recherche web basée sur une requête
   * @param query La requête de recherche
   * @returns Les sources trouvées
   */
  const searchWeb = async (query: string): Promise<SourceReference[]> => {
    setIsSearching(true);
    try {
      const sources = await performWebSearch(query);
      if (sources.length === 0) {
        toast({
          title: "Recherche web",
          description: "Aucun résultat trouvé pour cette requête.",
          variant: "destructive"
        });
      }
      return sources;
    } catch (error) {
      console.error("Error in web search:", error);
      toast({
        title: "Erreur de recherche",
        description: "Une erreur s'est produite lors de la recherche web.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };
  
  /**
   * Cherche une image basée sur une requête
   * @param query La requête pour l'image
   * @returns L'URL de l'image ou null
   */
  const searchImage = async (query: string): Promise<string | null> => {
    try {
      return await fetchImage(query);
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };
  
  return {
    searchWeb,
    searchImage,
    isSearching
  };
};
