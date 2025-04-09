
import { SourceReference } from "@/components/ChatMessage";

/**
 * Formate le contenu du message avec les références de sources
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

export const SAMPLE_QUESTIONS = [
  "Quelle est la différence entre l'intelligence artificielle et l'apprentissage automatique ?",
  "Comment puis-je améliorer ma productivité au quotidien ?",
  "Quelles sont les dernières tendances technologiques à surveiller ?",
  "Comment fonctionne la blockchain et les cryptomonnaies ?",
  "Quels sont les meilleurs livres de développement personnel à lire ?"
];

export const INITIAL_MESSAGES = [
  {
    id: "1",
    role: "assistant" as const,
    content:
      "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ?! 😊",
    timestamp: new Date(),
  },
];

export const getRandomSuggestedQuestions = (count: number = 3) => {
  return [...SAMPLE_QUESTIONS]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
};
