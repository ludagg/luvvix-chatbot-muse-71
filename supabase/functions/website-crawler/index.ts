
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

// Enhanced function to extract text content from HTML
function extractTextFromHTML(html: string, url: string): { text: string; metadata: any } {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) return { text: "", metadata: {} };
    
    // Extract metadata
    const metadata = {
      title: document.querySelector("title")?.textContent || "",
      description: document.querySelector("meta[name='description']")?.getAttribute("content") || 
                  document.querySelector("meta[property='og:description']")?.getAttribute("content") || "",
      siteName: document.querySelector("meta[property='og:site_name']")?.getAttribute("content") || new URL(url).hostname,
      favicon: document.querySelector("link[rel='icon']")?.getAttribute("href") || 
              document.querySelector("link[rel='shortcut icon']")?.getAttribute("href") || "",
    };
    
    // Remove script, style, and irrelevant elements
    const elementsToRemove = document.querySelectorAll("script, style, nav, footer, header, aside, iframe, noscript, svg, form");
    elementsToRemove.forEach(el => el.remove());
    
    // Get main content with better prioritization
    const mainContent =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.querySelector("div[role='main']") ||
      document.querySelector(".content") ||
      document.querySelector("#content") ||
      document.querySelector(".main") ||
      document.querySelector("#main") ||
      document.body;
    
    if (!mainContent) return { text: "", metadata };
    
    // Extract headings and content with structure
    let structuredContent = "";
    
    // Add headings
    const headings = mainContent.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach(heading => {
      structuredContent += `${heading.textContent?.trim()}\n\n`;
    });
    
    // Add paragraphs
    const paragraphs = mainContent.querySelectorAll("p");
    paragraphs.forEach(p => {
      const text = p.textContent?.trim();
      if (text && text.length > 20) { // Ignore very short paragraphs that might just be UI elements
        structuredContent += `${text}\n\n`;
      }
    });
    
    // Add lists
    const lists = mainContent.querySelectorAll("ul, ol");
    lists.forEach(list => {
      const items = list.querySelectorAll("li");
      items.forEach(item => {
        structuredContent += `• ${item.textContent?.trim()}\n`;
      });
      structuredContent += "\n";
    });
    
    // If we couldn't extract structured content, fall back to text content
    if (!structuredContent.trim()) {
      structuredContent = mainContent.textContent || "";
      // Clean up whitespace
      structuredContent = structuredContent.replace(/\s+/g, " ").trim();
    }
    
    return { text: structuredContent, metadata };
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    return { text: "", metadata: {} };
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
    const baseHostname = new URL(baseUrl).hostname;
    
    anchorElements.forEach(a => {
      try {
        const href = a.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          // Resolve relative URLs
          const url = new URL(href, baseUrl).toString();
          const urlObj = new URL(url);
          
          // Only include URLs from the same domain and ignore query parameters for deduplication
          if (urlObj.hostname === baseHostname) {
            // Normalize URL by removing trailing slash and common tracking parameters
            let normalizedUrl = url.replace(/\/$/, "");
            
            // Remove tracking parameters (utm_, ref, fbclid, etc.)
            try {
              const cleanUrl = new URL(normalizedUrl);
              ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"].forEach(param => {
                cleanUrl.searchParams.delete(param);
              });
              normalizedUrl = cleanUrl.toString();
            } catch (e) {
              // Ignore URL cleaning errors
            }
            
            // Avoid duplicates
            if (!links.includes(normalizedUrl)) {
              links.push(normalizedUrl);
            }
          }
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
    
    return links;
  } catch (error) {
    console.error("Error extracting links from HTML:", error);
    return [];
  }
}

// Advanced crawl function that attempts various techniques
async function advancedCrawlUrl(url: string): Promise<{ content: string, links: string[], metadata: any }> {
  try {
    console.log(`Attempting to crawl: ${url}`);
    
    // Try with a browser-like user agent first
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${url} with status ${response.status}`);
      return { content: "", links: [], metadata: {} };
    }
    
    const contentType = response.headers.get("content-type") || "";
    
    // Skip non-HTML content
    if (!contentType.includes("text/html")) {
      console.warn(`Skipping non-HTML content: ${contentType} at ${url}`);
      return { content: "", links: [], metadata: { title: url, contentType } };
    }
    
    const html = await response.text();
    const { text, metadata } = extractTextFromHTML(html, url);
    const links = extractLinksFromHTML(html, url);
    
    // Try to fix relative paths in metadata
    if (metadata.favicon && !metadata.favicon.startsWith('http')) {
      try {
        metadata.favicon = new URL(metadata.favicon, url).toString();
      } catch (e) {
        // Ignore favicon URL errors
      }
    }
    
    return { 
      content: text, 
      links, 
      metadata: {
        ...metadata,
        url,
        crawledAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return { content: "", links: [], metadata: {} };
  }
}

// Main crawl function
async function crawlWebsite(
  startUrl: string, 
  maxPages = 10, 
  maxDepth = 2,
  timeout = 60000
): Promise<{ content: string, urls: string[], metadata: any[] }> {
  // Enforce a hard timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Crawl timed out after ${timeout}ms`)), timeout);
  });
  
  try {
    // Crawl logic with timeout
    const crawlPromise = async () => {
      const visited = new Set<string>();
      const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
      let content = "";
      const visitedUrls: string[] = [];
      const allMetadata: any[] = [];
      
      // Normalize the start URL for proper deduplication
      const normalizeUrl = (url: string) => {
        return url.replace(/\/$/, "").split('#')[0];
      };
      
      const normalizedStartUrl = normalizeUrl(startUrl);
      
      // Process queue
      while (queue.length > 0 && visited.size < maxPages) {
        const { url, depth } = queue.shift()!;
        const normalizedUrl = normalizeUrl(url);
        
        if (visited.has(normalizedUrl) || depth > maxDepth) {
          continue;
        }
        
        console.log(`Crawling ${url} (depth: ${depth})`);
        visited.add(normalizedUrl);
        visitedUrls.push(url);
        
        const { content: pageContent, links, metadata } = await advancedCrawlUrl(url);
        
        if (pageContent) {
          content += `\n\n--- Content from ${url} ---\n\n${pageContent}`;
          allMetadata.push(metadata);
        }
        
        if (depth < maxDepth) {
          for (const link of links) {
            const normalizedLink = normalizeUrl(link);
            if (!visited.has(normalizedLink) && !queue.some(item => normalizeUrl(item.url) === normalizedLink)) {
              queue.push({ url: link, depth: depth + 1 });
            }
          }
        }
      }
      
      return { content: content.trim(), urls: visitedUrls, metadata: allMetadata };
    };
    
    // Race between crawl and timeout
    return await Promise.race([crawlPromise(), timeoutPromise]);
  } catch (error) {
    console.error("Crawl error:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { url, maxPages = 10, depth = 2, timeout = 60000 } = await req.json();
    
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
    
    // Start the crawl
    const result = await crawlWebsite(url, maxPages, depth, timeout);
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in website-crawler function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
