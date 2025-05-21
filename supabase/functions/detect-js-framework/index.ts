
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chromium } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error("URL is required");
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });
      
      // Run JavaScript detection on the page
      const frameworkDetection = await page.evaluate(() => {
        const html = document.documentElement.outerHTML;
        const frameworks = {
          'next': ['__NEXT_DATA__', '_next', 'next-route-announcer'],
          'react': ['react-root', 'react-dom', 'react-app'],
          'vue': ['__vue__', 'v-data', 'v-app'],
          'angular': ['ng-version', 'ng-app', 'ngReact'],
          'svelte': ['__SVELTE', '__svelte'],
          'nuxt': ['__NUXT__', 'nuxt-layout'],
          'gatsby': ['___gatsby', 'gatsby-focus-wrapper']
        };
        
        // Check for framework signals
        for (const [name, signals] of Object.entries(frameworks)) {
          for (const signal of signals) {
            if (html.includes(signal)) {
              return { isJs: true, name };
            }
          }
        }
        
        // Check window objects that might indicate frameworks
        const windowObjects = [
          { name: 'react', check: () => window.React !== undefined || window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined },
          { name: 'vue', check: () => window.Vue !== undefined || window.__VUE__ !== undefined },
          { name: 'angular', check: () => window.ng !== undefined || window.angular !== undefined },
          { name: 'next', check: () => window.__NEXT_DATA__ !== undefined },
          { name: 'nuxt', check: () => window.__NUXT__ !== undefined }
        ];
        
        for (const obj of windowObjects) {
          try {
            if (obj.check()) {
              return { isJs: true, name: obj.name };
            }
          } catch (e) {
            // Ignore errors when checking window objects
          }
        }
        
        // Check if page has many scripts (indicative of JS frameworks)
        const scriptCount = document.scripts.length;
        if (scriptCount > 10) {
          return { isJs: true, name: 'unknown' };
        }
        
        return { isJs: false };
      });
      
      return new Response(
        JSON.stringify({ 
          isJsFramework: frameworkDetection.isJs,
          framework: frameworkDetection.isJs ? frameworkDetection.name : null
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    } finally {
      await browser.close();
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ 
        isJsFramework: false,
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 500
      }
    );
  }
});
