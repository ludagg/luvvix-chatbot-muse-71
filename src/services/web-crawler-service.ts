
import { supabase } from "@/integrations/supabase/client";

interface CrawlOptions {
  maxPages?: number;
  depth?: number;
  timeout?: number;
}

interface CrawlResult {
  success: boolean;
  content?: string;
  error?: string;
  urls?: string[];
}

/**
 * Service for crawling web content to use as context for AI agents
 */
class WebCrawlerService {
  /**
   * Extracts content from a website URL using the Supabase Edge Function
   * 
   * @param url The URL to crawl
   * @param options Crawling options
   * @returns The crawled content and metadata
   */
  async crawlWebsite(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    try {
      console.log(`Starting web crawl for URL: ${url}`);
      
      const { data, error } = await supabase.functions.invoke('website-crawler', {
        body: {
          url,
          maxPages: options.maxPages || 10, 
          depth: options.depth || 2,
          timeout: options.timeout || 30000
        }
      });
      
      if (error) {
        console.error('Error calling website-crawler function:', error);
        return {
          success: false,
          error: `Failed to crawl website: ${error.message}`
        };
      }
      
      return {
        success: true,
        content: data.content,
        urls: data.urls
      };
    } catch (error) {
      console.error('Error in crawlWebsite:', error);
      return {
        success: false,
        error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Adds the crawled content to an agent's context
   * 
   * @param agentId The ID of the agent
   * @param url The URL that was crawled
   * @param content The extracted content
   * @returns Success status
   */
  async addCrawledContentToAgentContext(agentId: string, url: string, content: string): Promise<boolean> {
    try {
      // First check if this URL is already in the agent's context
      const { data: existingContext } = await supabase
        .from('ai_agent_context')
        .select('id')
        .eq('agent_id', agentId)
        .eq('url', url)
        .maybeSingle();
      
      if (existingContext) {
        // Update existing context
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
        // Insert new context
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
      console.error('Error adding crawled content to agent context:', error);
      return false;
    }
  }
}

export default new WebCrawlerService();
