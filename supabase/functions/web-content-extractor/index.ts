
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, options } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'URL is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid URL format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const extractOptions = {
      useJavascript: options?.useJavascript || false,
      waitTime: options?.waitTime || 2000,
      selector: options?.selector,
      depth: options?.depth || 1
    };

    console.log(`Extracting content from: ${url}`);
    console.log(`Options:`, extractOptions);

    let content = '';
    let isJsFramework = false;
    let detectedFramework = '';

    if (extractOptions.useJavascript) {
      // Pour les sites JavaScript, nous simulons l'extraction
      // Dans un vrai environnement, vous utiliseriez Puppeteer ou Playwright
      console.log(`Using JavaScript rendering for: ${url}`);
      
      // Simulation d'une extraction avec support JavaScript
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      content = await response.text();
      
      // Détection de framework JavaScript
      if (content.includes('react') || content.includes('React') || content.includes('_react')) {
        isJsFramework = true;
        detectedFramework = 'React';
      } else if (content.includes('vue') || content.includes('Vue') || content.includes('_vue')) {
        isJsFramework = true;
        detectedFramework = 'Vue.js';
      } else if (content.includes('angular') || content.includes('Angular') || content.includes('ng-')) {
        isJsFramework = true;
        detectedFramework = 'Angular';
      } else if (content.includes('svelte') || content.includes('Svelte')) {
        isJsFramework = true;
        detectedFramework = 'Svelte';
      }

    } else {
      // Extraction HTML classique
      console.log(`Standard HTML extraction for: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      content = await response.text();
    }

    // Appliquer le sélecteur CSS si spécifié
    if (extractOptions.selector && content) {
      try {
        // Pour une vraie implémentation, vous utiliseriez un parser DOM
        // Ici nous simulons l'extraction par sélecteur
        console.log(`Applying CSS selector: ${extractOptions.selector}`);
        
        // Simulation simple de l'extraction par sélecteur
        const selectorRegex = new RegExp(`<[^>]*class="[^"]*${extractOptions.selector.replace('.', '')}[^"]*"[^>]*>([\\s\\S]*?)<\/[^>]+>`, 'i');
        const match = content.match(selectorRegex);
        if (match && match[1]) {
          content = match[1];
        }
      } catch (error) {
        console.log('Selector application failed:', error);
        // Continue avec le contenu complet si le sélecteur échoue
      }
    }

    // Nettoyer le contenu si nécessaire
    if (content.length > 100000) {
      content = content.substring(0, 100000) + '... [Contenu tronqué]';
    }

    console.log(`Content extracted successfully. Length: ${content.length} characters`);
    console.log(`JS Framework detected: ${isJsFramework ? detectedFramework : 'None'}`);

    return new Response(JSON.stringify({ 
      success: true, 
      content,
      isJsFramework,
      detectedFramework: isJsFramework ? detectedFramework : undefined,
      url,
      extractedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error extracting web content:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
