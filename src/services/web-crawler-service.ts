
import { supabase } from "@/integrations/supabase/client";

interface CrawlOptions {
  maxPages?: number;
  depth?: number;
  timeout?: number;
  userAgent?: string;
}

interface CrawlResult {
  success: boolean;
  content?: string;
  error?: string;
  urls?: string[];
  metadata?: any[];
}

/**
 * Service amélioré pour l'extraction de contenu web pour les agents IA
 */
class WebCrawlerService {
  /**
   * Extrait le contenu d'un site web en utilisant la fonction Edge de Supabase
   * 
   * @param url L'URL à explorer
   * @param options Options d'exploration
   * @returns Le contenu exploré et les métadonnées
   */
  async crawlWebsite(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    try {
      console.log(`Début de l'extraction web pour l'URL: ${url}`);
      
      // Valider l'URL avant d'envoyer la requête
      try {
        new URL(url); // Vérifie si l'URL est valide
      } catch (e) {
        return {
          success: false,
          error: `URL invalide: ${url}`
        };
      }
      
      const { data, error } = await supabase.functions.invoke('website-crawler', {
        body: {
          url,
          maxPages: options.maxPages || 10, 
          depth: options.depth || 2,
          timeout: options.timeout || 60000,
          userAgent: options.userAgent || "Mozilla/5.0 LuvviX AI WebCrawler Bot/1.0"
        }
      });
      
      if (error) {
        console.error('Erreur lors de l\'appel à la fonction website-crawler:', error);
        return {
          success: false,
          error: `Échec de l'exploration du site: ${error.message}`
        };
      }
      
      // Vérifier si la réponse contient une erreur explicite
      if (data && 'error' in data) {
        console.error('Erreur retournée par website-crawler:', data.error);
        return {
          success: false,
          error: `Échec de l'exploration du site: ${data.error}`
        };
      }
      
      // Vérifier si nous avons obtenu du contenu
      if (!data || !data.content || data.content.trim().length === 0) {
        return {
          success: false,
          error: 'Aucun contenu n\'a pu être extrait du site web'
        };
      }
      
      console.log(`Extraction réussie pour ${url}, ${data.urls?.length || 0} URLs trouvées, ${data.content.length} caractères de contenu`);
      
      return {
        success: true,
        content: data.content,
        urls: data.urls,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Erreur dans crawlWebsite:', error);
      return {
        success: false,
        error: `Une erreur inattendue s'est produite: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Ajoute le contenu extrait au contexte d'un agent
   * 
   * @param agentId L'ID de l'agent
   * @param url L'URL qui a été explorée
   * @param content Le contenu extrait
   * @returns Statut de succès
   */
  async addCrawledContentToAgentContext(agentId: string, url: string, content: string): Promise<boolean> {
    try {
      // Vérifier d'abord si cette URL est déjà dans le contexte de l'agent
      const { data: existingContext } = await supabase
        .from('ai_agent_context')
        .select('id')
        .eq('agent_id', agentId)
        .eq('url', url)
        .maybeSingle();
      
      if (existingContext) {
        // Mettre à jour le contexte existant
        const { error: updateError } = await supabase
          .from('ai_agent_context')
          .update({
            content,
            content_type: 'text',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContext.id);
          
        if (updateError) throw updateError;
      } else {
        // Insérer un nouveau contexte
        const { error: insertError } = await supabase
          .from('ai_agent_context')
          .insert({
            agent_id: agentId,
            content_type: 'text',
            content,
            url,
            created_at: new Date().toISOString()
          });
          
        if (insertError) throw insertError;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contenu extrait au contexte de l\'agent:', error);
      return false;
    }
  }
  
  /**
   * Teste si une URL peut être explorée
   * 
   * @param url L'URL à tester
   * @returns Résultat du test
   */
  async testUrl(url: string): Promise<{ success: boolean, message?: string }> {
    try {
      // Valider l'URL
      try {
        new URL(url); // Vérifie si l'URL est valide
      } catch (e) {
        return {
          success: false,
          message: `URL invalide: ${url}`
        };
      }
      
      // Faire une requête HEAD pour vérifier si l'URL est accessible
      const { data, error } = await supabase.functions.invoke('website-crawler', {
        body: {
          url,
          maxPages: 1,
          depth: 0,
          timeout: 10000,
          testOnly: true
        }
      });
      
      if (error || (data && 'error' in data)) {
        return {
          success: false,
          message: `Impossible d'accéder à l'URL: ${error?.message || data?.error || 'Erreur inconnue'}`
        };
      }
      
      return {
        success: true,
        message: 'URL accessible'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test de l'URL: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export default new WebCrawlerService();
