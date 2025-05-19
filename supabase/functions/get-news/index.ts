
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// API endpoint for GNews API (gratuit avec limite de requêtes raisonnable)
const GNEWS_API_URL = "https://gnews.io/api/v4";
const API_KEY = Deno.env.get("GNEWS_API_KEY") || "";

interface NewsRequestParams {
  country?: string;
  category?: string;
  q?: string;
  max?: number;
  page?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error("GNEWS_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({
          error: "API key is not configured",
          message: "Please set the GNEWS_API_KEY in your Edge Function secrets",
          items: [] // Return empty array to prevent UI breaks
        }),
        {
          status: 200, // Return 200 to prevent fetch errors on client
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Log masked API key to verify it's present
      const maskedKey = API_KEY.substring(0, 4) + "..." + API_KEY.substring(API_KEY.length - 4);
      console.log(`Using GNews API key: ${maskedKey}`);
    }

    // Extract parameters from the request URL
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "general";
    const country = url.searchParams.get("country") || "fr";
    const search = url.searchParams.get("q") || "";
    const max = url.searchParams.get("max") || "10";
    const page = url.searchParams.get("page") || "1";

    // Log the parameters for debugging
    console.log(`Processing request with params: category=${category}, country=${country}, search=${search}, max=${max}, page=${page}`);
    
    // Construct API request parameters
    const params: NewsRequestParams = {
      max: parseInt(max),
      page: parseInt(page),
    };

    // Add country if provided (GNews uses 2-letter country codes)
    if (country) {
      params.country = country;
    }

    // Add category if it's not "all"
    if (category && category !== "all") {
      params.category = category;
    }

    // Choose endpoint based on whether search is provided
    let endpoint = "top-headlines";
    
    // Add search query if provided
    if (search) {
      params.q = search;
      endpoint = "search"; // Use search endpoint when query is provided
    }

    // Construct the API URL
    const apiUrl = new URL(`${GNEWS_API_URL}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      apiUrl.searchParams.append(key, value.toString());
    });
    
    // Always add the API key
    apiUrl.searchParams.append("apikey", API_KEY);
    // Set language to French
    apiUrl.searchParams.append("lang", "fr");

    // Make the API request
    console.log(`Fetching news from: ${apiUrl.toString().replace(API_KEY, "API_KEY_HIDDEN")}`);
    const response = await fetch(apiUrl.toString());

    // Log the response status
    console.log(`GNews API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GNews API error: ${response.status} - ${errorText}`);
      
      let errorMessage = "Une erreur s'est produite lors de la récupération des actualités";
      
      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = "La clé API est invalide ou expirée. Veuillez vérifier votre clé GNews.";
      } else if (response.status === 429) {
        errorMessage = "Limite de requêtes atteinte pour la clé API. Veuillez réessayer plus tard.";
      }
      
      return new Response(
        JSON.stringify({
          error: `GNews API error: ${response.status}`,
          details: errorText,
          message: errorMessage,
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
    if (!data.articles || data.articles.length === 0) {
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
      items: data.articles.map((article: any) => ({
        id: article.url, // Use URL as ID since GNews API doesn't provide unique IDs
        title: article.title,
        summary: article.description || "",
        content: article.content || "",
        publishedAt: article.publishedAt,
        source: article.source?.name || "Source inconnue",
        category: category !== "all" ? category : "general",
        url: article.url,
        imageUrl: article.image,
        location: {
          country: country || "fr"
        }
      })),
      totalResults: data.totalArticles || data.articles.length,
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
