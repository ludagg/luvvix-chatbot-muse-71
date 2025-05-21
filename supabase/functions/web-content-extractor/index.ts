
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
    const { url, options } = await req.json();
    
    if (!url) {
      throw new Error("URL is required");
    }

    let content = "";
    let isJsFramework = false;
    let detectedFramework = "";
    
    // Check if JavaScript rendering is required
    if (options?.useJavascript) {
      // Using Puppeteer for JavaScript rendering
      const browser = await chromium.launch();
      try {
        const page = await browser.newPage();
        await page.goto(url, { 
          waitUntil: "networkidle0",
          timeout: options.waitTime || 30000
        });
        
        // Detect framework
        const frameworkDetection = await page.evaluate(() => {
          const html = document.documentElement.outerHTML;
          const frameworks = {
            'next': ['__NEXT_DATA__', 'next-page'],
            'react': ['react-root', 'react-app'],
            'vue': ['__vue__', 'v-app'],
            'angular': ['ng-app', 'ng-version'],
            'svelte': ['svelte-', '__svelte']
          };
          
          for (const [name, signals] of Object.entries(frameworks)) {
            for (const signal of signals) {
              if (html.includes(signal)) {
                return { isJs: true, name };
              }
            }
          }
          
          return { isJs: false };
        });
        
        isJsFramework = frameworkDetection.isJs;
        detectedFramework = frameworkDetection.name || "";
        
        // Extract content based on selector if provided, otherwise get all text
        if (options.selector) {
          await page.waitForSelector(options.selector, { timeout: 5000 }).catch(() => {});
          content = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent || element.innerText : document.body.innerText;
          }, options.selector);
        } else {
          content = await page.evaluate(() => document.body.innerText);
        }
        
        // Wait additional time if specified to ensure dynamic content loads
        if (options.waitTime) {
          await page.waitForTimeout(options.waitTime);
        }
      } finally {
        await browser.close();
      }
    } else {
      // Simple fetch for static sites
      const response = await fetch(url);
      const html = await response.text();
      
      // Basic framework detection from HTML
      isJsFramework = html.includes('react') || html.includes('next') || 
                      html.includes('vue') || html.includes('angular');
      
      if (html.includes('__NEXT_DATA__')) {
        detectedFramework = 'next';
      } else if (html.includes('react')) {
        detectedFramework = 'react';
      }
      
      // Extract content (simplified version for non-JS sites)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      content = doc.body.textContent || '';
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        content, 
        isJsFramework, 
        detectedFramework 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
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
