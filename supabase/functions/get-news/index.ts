import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// On utilise RSS2JSON pour convertir les flux RSS en JSON (API gratuite et fiable)
const RSS2JSON_API_URL = "https://api.rss2json.com/v1/api.json";
const NEWS_FEEDS = {
  all: "https://news.google.com/rss",
  business: "https://news.google.com/rss/headlines/section/topic/BUSINESS",
  technology: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY",
  entertainment: "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT",
  sports: "https://news.google.com/rss/headlines/section/topic/SPORTS",
  science: "https://news.google.com/rss/headlines/section/topic/SCIENCE",
  health: "https://news.google.com/rss/headlines/section/topic/HEALTH",
  general: "https://news.google.com/rss/headlines/section/topic/WORLD",
};

// Pour les recherches spécifiques
const getSearchFeed = (query: string, country: string = 'fr') => {
  const baseUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
  const fullUrl = country ? `${baseUrl}&gl=${country.toLowerCase()}` : baseUrl;
  return fullUrl;
};

// Pour filtrer par pays (si précisé)
const getCountryFeed = (category: string, country: string) => {
  const feed = NEWS_FEEDS[category as keyof typeof NEWS_FEEDS] || NEWS_FEEDS.all;
  return `${feed}?gl=${country.toLowerCase()}`;
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract parameters from the request body
    const params = await req.json();
    const category = params.category || "all";
    const country = params.country || "fr";
    const query = params.query || "";
    
    console.log(`Processing request with params: category=${category}, country=${country}, query=${query}`);
    
    // Determine which feed to use
    let feedUrl: string;
    
    if (query) {
      // If search query provided, use search feed
      feedUrl = getSearchFeed(query, country);
    } else if (country) {
      // If country provided, get country-specific feed
      feedUrl = getCountryFeed(category, country);
    } else {
      // Otherwise use default feed
      feedUrl = NEWS_FEEDS[category as keyof typeof NEWS_FEEDS] || NEWS_FEEDS.all;
    }
    
    // Construct the API URL for RSS2JSON
    const apiUrl = new URL(RSS2JSON_API_URL);
    apiUrl.searchParams.append("rss_url", feedUrl);
    apiUrl.searchParams.append("count", "20");
    
    console.log(`Fetching news from RSS feed: ${feedUrl}`);
    
    // Make the API request
    const response = await fetch(apiUrl.toString());
    
    console.log(`RSS2JSON API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RSS2JSON API error: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({
          error: `RSS2JSON API error: ${response.status}`,
          details: errorText,
          message: "Une erreur s'est produite lors de la récupération des actualités",
          items: [] // Return empty array to prevent UI breaks
        }),
        {
          status: 200, // Return 200 to prevent fetch errors on client
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const data = await response.json();
    
    // Verify the response data structure
    console.log(`Response data structure: ${JSON.stringify(Object.keys(data))}`);
    
    // Check if articles were found
    if (!data.items || data.items.length === 0) {
      console.log("No articles found in the API response");
      return new Response(
        JSON.stringify({
          items: [],
          totalResults: 0,
          status: "ok",
          message: "Aucun article trouvé avec les critères spécifiés."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Transform the response to match our NewsItem type
    const transformedData = {
      items: data.items.map((item: any, index: number) => ({
        id: item.guid || `news-${index}-${Date.now()}`,
        title: item.title,
        summary: item.description || "",
        content: item.content || "",
        publishedAt: item.pubDate,
        source: item.author || item.source?.name || "Actualités Google",
        category: category !== "all" ? category : "general",
        url: item.link,
        imageUrl: extractImageFromDescription(item.description) || extractImageFromContent(item.content),
        location: {
          country: country || "fr"
        }
      })),
      totalResults: data.items.length,
      status: "ok",
    };
    
    console.log(`Successfully fetched ${transformedData.items.length} articles`);
    
    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch news data",
        items: [], // Return empty array to prevent UI breaks
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper function to extract image from description
function extractImageFromDescription(description: string): string | null {
  if (!description) return null;
  
  const imgRegex = /<img.*?src=["'](.*?)["']/;
  const match = description.match(imgRegex);
  
  return match ? match[1] : null;
}

// Helper function to extract image from content
function extractImageFromContent(content: string): string | null {
  if (!content) return null;
  
  const imgRegex = /<img.*?src=["'](.*?)["']/;
  const match = content.match(imgRegex);
  
  return match ? match[1] : "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000";
}
