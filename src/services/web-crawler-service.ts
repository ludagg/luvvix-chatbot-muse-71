
import { supabase } from "@/integrations/supabase/client";

interface WebCrawlOptions {
  useJavascript: boolean;
  waitTime: number; // in milliseconds
  selector?: string;
  depth?: number;
}

interface WebCrawlResult {
  success: boolean;
  content?: string;
  error?: string;
  isJsFramework?: boolean;
  detectedFramework?: string;
}

interface FrameworkDetectionResult {
  isJsFramework: boolean;
  framework?: string;
}

export const WebCrawlerService = {
  async extractContentFromUrl(url: string, options: WebCrawlOptions): Promise<WebCrawlResult> {
    try {
      const { data, error } = await supabase.functions.invoke('web-content-extractor', {
        body: {
          url,
          options: {
            useJavascript: options.useJavascript,
            waitTime: options.waitTime,
            selector: options.selector,
            depth: options.depth || 1
          }
        }
      });

      if (error) {
        console.error("Error extracting content:", error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        content: data.content,
        isJsFramework: data.isJsFramework,
        detectedFramework: data.detectedFramework
      };
    } catch (error) {
      console.error("Error in web crawler service:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract content"
      };
    }
  },

  async detectFrameworkFromUrl(url: string): Promise<FrameworkDetectionResult> {
    try {
      const { data, error } = await supabase.functions.invoke('detect-js-framework', {
        body: { url }
      });
      
      if (error) {
        console.error("Error detecting framework:", error);
        return { isJsFramework: false };
      }
      
      return {
        isJsFramework: !!data.isJsFramework,
        framework: data.framework
      };
    } catch (error) {
      console.error("Error in framework detection:", error);
      return { isJsFramework: false };
    }
  }
};
