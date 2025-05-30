
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'web' | 'video' | 'image' | 'file';
  title: string;
  snippet: string;
  url: string;
  source: string;
}

export const aiService = {
  async generateSearchSummary(query: string, results: SearchResult[]): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-search-summary', {
        body: {
          query,
          results: results.slice(0, 5) // Limiter pour éviter les tokens excessifs
        }
      });

      if (error) throw error;
      return data.summary;
    } catch (error) {
      console.error('Erreur résumé IA:', error);
      return this.getFallbackSummary(query, results);
    }
  },

  async generateSearchSuggestions(query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-search-suggestions', {
        body: { query }
      });

      if (error) throw error;
      return data.suggestions;
    } catch (error) {
      console.error('Erreur suggestions IA:', error);
      return this.getFallbackSuggestions(query);
    }
  },

  async processUserMessage(message: string, context: SearchResult[]): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message,
          context: context.slice(0, 3)
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Erreur traitement message:', error);
      return `Je comprends votre question sur "${message}". Basé sur les résultats de recherche disponibles, je peux vous aider à approfondir certains aspects. Pouvez-vous préciser ce qui vous intéresse le plus ?`;
    }
  },

  getFallbackSummary(query: string, results: SearchResult[]): string {
    const webResults = results.filter(r => r.type === 'web').length;
    const videoResults = results.filter(r => r.type === 'video').length;
    const imageResults = results.filter(r => r.type === 'image').length;

    return `**Résumé de votre recherche sur "${query}"**

📊 **Résultats trouvés:** ${results.length} éléments
- ${webResults} pages web
- ${videoResults} vidéos  
- ${imageResults} images

🔍 **Analyse principale:**
Les résultats montrent que ${query} est un sujet avec plusieurs dimensions importantes. Les sources principales incluent ${results.slice(0, 3).map(r => r.source).join(', ')}.

💡 **Points clés identifiés:**
${results.slice(0, 3).map((r, i) => `${i + 1}. ${r.title}`).join('\n')}

🚀 **Suggestions pour approfondir:**
- Rechercher des aspects spécifiques
- Consulter les vidéos pour des explications détaillées
- Explorer les liens connexes

Que souhaitez-vous explorer en priorité ?`;
  },

  getFallbackSuggestions(query: string): string[] {
    const baseQuery = query.toLowerCase();
    return [
      `${query} guide complet`,
      `${query} actualités 2024`,
      `comment utiliser ${query}`,
      `${query} avantages inconvénients`,
      `${query} tutoriel débutant`
    ];
  }
};
