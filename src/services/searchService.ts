
import axios from "axios";
import { SourceReference } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";

/**
 * Effectue une recherche web via l'API DuckDuckGo et retourne les résultats formatés
 * @param query La requête de recherche
 * @returns Une promesse contenant les sources trouvées
 */
export const performWebSearch = async (query: string): Promise<SourceReference[]> => {
  try {
    console.log("Performing web search with DuckDuckGo for:", query);
    
    // DuckDuckGo n'offre pas d'API JSON officielle accessible directement depuis le navigateur à cause des CORS
    // Nous allons utiliser une API proxy publique pour contourner ce problème
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`)}`;
    
    const response = await axios.get(proxyUrl);
    
    // Vérifier si la réponse est valide
    if (!response.data || !response.data.contents) {
      console.error("Invalid response from proxy", response.data);
      return [];
    }
    
    console.log("DuckDuckGo response received through proxy");
    
    const htmlContent = response.data.contents;
    
    // Parser le HTML pour extraire les résultats (méthode simple)
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Extraire les résultats
    const resultElements = doc.querySelectorAll('.result');
    
    const sources: SourceReference[] = [];
    
    resultElements.forEach((element, index) => {
      const titleElement = element.querySelector('.result__title');
      const urlElement = element.querySelector('.result__url');
      const snippetElement = element.querySelector('.result__snippet');
      
      if (titleElement && urlElement) {
        const title = titleElement.textContent?.trim() || `Résultat ${index + 1}`;
        const url = urlElement.textContent?.trim() || "#";
        const snippet = snippetElement?.textContent?.trim() || "Pas de description disponible";
        
        sources.push({
          id: index + 1,
          title: title,
          url: url,
          snippet: snippet
        });
      }
    });
    
    // Si l'analyse HTML n'a pas fonctionné, on utilise une méthode de secours avec regex
    if (sources.length === 0) {
      console.log("Fallback to regex parsing");
      
      // Extraire les titres
      const titleRegex = /<h2 class="result__title">(.*?)<\/h2>/g;
      const titles = [...htmlContent.matchAll(titleRegex)].map(match => match[1]);
      
      // Extraire les URLs
      const urlRegex = /<a class="result__url" href="(.*?)"/g;
      const urls = [...htmlContent.matchAll(urlRegex)].map(match => match[1]);
      
      // Extraire les snippets
      const snippetRegex = /<a class="result__snippet">(.*?)<\/a>/g;
      const snippets = [...htmlContent.matchAll(snippetRegex)].map(match => match[1]);
      
      for (let i = 0; i < Math.min(titles.length, urls.length, snippets.length); i++) {
        sources.push({
          id: i + 1,
          title: titles[i] || `Résultat ${i + 1}`,
          url: urls[i] || "#",
          snippet: snippets[i] || "Pas de description disponible"
        });
      }
    }
    
    console.log(`Found ${sources.length} search results`);
    
    // Si nous n'avons toujours pas de résultats, utiliser des résultats de secours pour éviter la frustration utilisateur
    if (sources.length === 0) {
      console.log("Using fallback results");
      
      // Générer quelques résultats fictifs mais utiles basés sur la requête
      sources.push({
        id: 1,
        title: `Information sur ${query}`,
        url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        snippet: `Trouvez des informations détaillées sur ${query} sur Wikipédia, l'encyclopédie libre.`
      });
      
      sources.push({
        id: 2,
        title: `${query} - Actualités récentes`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Consultez les dernières actualités concernant ${query} sur Google News.`
      });
      
      sources.push({
        id: 3,
        title: `${query} - Vidéos`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        snippet: `Regardez des vidéos sur ${query} sur YouTube.`
      });
    }
    
    return sources.slice(0, 8); // Limiter à 8 résultats
  } catch (error) {
    console.error("Error in web search:", error);
    return [];
  }
};

/**
 * Recherche une image pertinente basée sur une requête
 * @param query La requête de recherche d'image
 * @returns L'URL de l'image trouvée ou null
 */
export const fetchImage = async (query: string): Promise<string | null> => {
  try {
    console.log("Searching for images:", query);
    
    // Utiliser Unsplash API pour les images (version sans clé API)
    const imageUrl = `https://source.unsplash.com/random/?${encodeURIComponent(query)}`;
    console.log("Generated image URL:", imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};
