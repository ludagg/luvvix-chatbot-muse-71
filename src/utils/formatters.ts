
import { SourceReference } from "@/components/ChatMessage";

/**
 * Formate le contenu de la réponse pour inclure les citations de sources au format Markdown
 * @param content Le contenu de la réponse
 * @param sources Les sources à citer
 * @returns Le contenu formaté avec les citations
 */
export const formatSourceCitations = (content: string, sources: SourceReference[]): string => {
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
