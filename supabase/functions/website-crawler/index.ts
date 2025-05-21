
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Function to get data from cache
function getCachedData(key: string): any | null {
  const cachedItem = cache.get(key);
  if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_TTL) {
    return cachedItem.data;
  }
  return null;
}

// Function to set data in cache
function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Function to extract text content from HTML
function extractTextFromHTML(html: string): string {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) return "";
    
    // Remove script and style elements
    const scripts = document.querySelectorAll("script, style, nav, footer, header, aside, iframe");
    scripts.forEach(script => script.remove());
    
    // Get main content
    const mainContent = document.querySelector("main") || document.querySelector("article") || document.body;
    
    if (!mainContent) return "";
    
    // Get text content and clean up
    let text = mainContent.textContent || "";
    
    // Remove extra whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    return text;
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    return "";
  }
}

// Function to extract links from HTML
function extractLinksFromHTML(html: string, baseUrl: string): string[] {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) return [];
    
    const links: string[] = [];
    const anchorElements = document.querySelectorAll("a[href]");
    
    anchorElements.forEach(a => {
      const href = a.getAttribute("href");
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        try {
          // Resolve relative URLs
          const url = new URL(href, baseUrl).toString();
          
          // Only include URLs from the same domain
          if (new URL(url).hostname === new URL(baseUrl).hostname) {
            links.push(url);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Remove duplicates
    return [...new Set(links)];
  } catch (error) {
    console.error("Error extracting links from HTML:", error);
    return [];
  }
}

// Crawl a single URL
async function crawlUrl(url: string): Promise<{ content: string, links: string[] }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 LuvviX AI WebCrawler Bot/1.0"
      }
    });
    
    if (!response.ok) {
      return { content: "", links: [] };
    }
    
    const html = await response.text();
    const content = extractTextFromHTML(html);
    const links = extractLinksFromHTML(html, url);
    
    return { content, links };
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return { content: "", links: [] };
  }
}

// Main crawl function
async function crawlWebsite(
  startUrl: string, 
  maxPages = 10, 
  maxDepth = 2
): Promise<{ content: string, urls: string[] }> {
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  let content = "";
  const visitedUrls: string[] = [];
  
  // Process queue
  while (queue.length > 0 && visited.size < maxPages) {
    const { url, depth } = queue.shift()!;
    
    if (visited.has(url) || depth > maxDepth) {
      continue;
    }
    
    console.log(`Crawling ${url} (depth: ${depth})`);
    visited.add(url);
    visitedUrls.push(url);
    
    const { content: pageContent, links } = await crawlUrl(url);
    content += `\n\n--- Content from ${url} ---\n\n${pageContent}`;
    
    if (depth < maxDepth) {
      for (const link of links) {
        if (!visited.has(link) && queue.findIndex(item => item.url === link) === -1) {
          queue.push({ url: link, depth: depth + 1 });
        }
      }
    }
  }
  
  return { content: content.trim(), urls: visitedUrls };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { url, maxPages = 10, depth = 2, timeout = 30000 } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    // Check cache first
    const cacheKey = `${url}_${maxPages}_${depth}`;
    const cachedResult = getCachedData(cacheKey);
    
    if (cachedResult) {
      console.log(`Returning cached result for ${url}`);
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Starting crawl of ${url} with maxPages=${maxPages}, depth=${depth}`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Crawl timeout')), timeout);
    });
    
    // Race between crawl and timeout
    const result = await Promise.race([
      crawlWebsite(url, maxPages, depth),
      timeoutPromise
    ]) as { content: string, urls: string[] };
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in website-crawler function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
