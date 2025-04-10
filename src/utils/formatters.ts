
import { SourceReference } from "@/components/ChatMessage";

/**
 * Formate le contenu de la réponse pour inclure les citations de sources au format Markdown
 * @param content Le contenu de la réponse
 * @param sources Les sources à citer
 * @returns Le contenu formaté avec les citations
 */
export const formatSourceCitations = (content: string, sources: SourceReference[]): string => {
  let formattedContent = content;
  
  // Remplacer les balises de citation par des liens numérotés
  sources.forEach(source => {
    const sourceTag = `[${source.id}]`;
    formattedContent = formattedContent.replace(
      new RegExp(`\\[cite:${source.id}\\]`, 'g'), 
      sourceTag
    );
  });
  
  // Éviter d'ajouter les sources en double à la fin
  if (sources.length > 0 && !formattedContent.includes("Sources:")) {
    // Supprimons la signature si elle existe pour éviter la duplication
    formattedContent = formattedContent.replace(/\n\n\*— LuvviX.*?\*$/g, '');
    
    // Ajouter une section Sources propre
    formattedContent += "\n\n**Sources:**\n";
    sources.forEach(source => {
      let displayTitle = source.title;
      // Vérifier si le titre est un titre générique et l'améliorer
      if (source.title.includes("Résultat de recherche")) {
        // Extraire le terme de recherche s'il existe
        const searchTerm = source.title.match(/pour (.+)$/);
        if (searchTerm && searchTerm[1]) {
          displayTitle = searchTerm[1];
        }
      }
      formattedContent += `${source.id}. [${displayTitle}](${source.url})\n`;
    });
  }
  
  return formattedContent;
};
