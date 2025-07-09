import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  publishedAt: string;
  source: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 Début de l'envoi des notifications quotidiennes d'actualités");

    // Obtenir les actualités du jour
    const headlines = await fetchTodaysHeadlines();
    
    if (headlines.length === 0) {
      console.log("❌ Aucune actualité trouvée pour aujourd'hui");
      return new Response(JSON.stringify({ error: "No headlines found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`📰 ${headlines.length} actualités trouvées`);

    // Obtenir tous les utilisateurs actifs (qui ont des profils)
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, username, full_name')
      .limit(1000);

    if (usersError) {
      console.error("❌ Erreur récupération utilisateurs:", usersError);
      throw usersError;
    }

    console.log(`👥 ${users?.length || 0} utilisateurs trouvés`);

    let successCount = 0;
    let errorCount = 0;

    // Envoyer les notifications à chaque utilisateur
    for (const user of users || []) {
      try {
        // Vérifier si l'utilisateur a déjà reçu sa notification aujourd'hui
        const { data: existingNotif } = await supabase
          .from('daily_news_notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('news_date', new Date().toISOString().split('T')[0])
          .single();

        if (existingNotif) {
          console.log(`⏭️ Notification déjà envoyée pour ${user.username}`);
          continue;
        }

        // Sauvegarder la notification en base
        const { error: saveError } = await supabase
          .from('daily_news_notifications')
          .insert({
            user_id: user.id,
            headlines: headlines,
            news_date: new Date().toISOString().split('T')[0]
          });

        if (saveError) {
          console.error(`❌ Erreur sauvegarde notification pour ${user.username}:`, saveError);
          errorCount++;
          continue;
        }

        console.log(`✅ Notification sauvegardée pour ${user.username}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Erreur pour l'utilisateur ${user.username}:`, error);
        errorCount++;
      }
    }

    console.log(`📊 Résultats: ${successCount} succès, ${errorCount} erreurs`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications envoyées avec succès à ${successCount} utilisateurs`,
        headlines_count: headlines.length,
        users_notified: successCount,
        errors: errorCount
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("💥 Erreur générale:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Erreur lors de l'envoi des notifications"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function fetchTodaysHeadlines(): Promise<NewsItem[]> {
  try {
    // Sources RSS françaises fiables
    const rssFeeds = [
      'https://www.francetvinfo.fr/titres.rss',
      'https://www.lemonde.fr/rss/une.xml',
      'https://rss.cnn.com/rss/edition.rss',
      'https://feeds.bbci.co.uk/news/world/rss.xml'
    ];

    const allNews: NewsItem[] = [];
    
    for (const feedUrl of rssFeeds) {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=5`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'ok' && data.items) {
            const todayNews = data.items
              .filter((item: any) => {
                const itemDate = new Date(item.pubDate);
                const today = new Date();
                return itemDate.toDateString() === today.toDateString();
              })
              .map((item: any) => ({
                id: `${item.link}_${Date.now()}`,
                title: item.title?.substring(0, 120) || 'Sans titre',
                summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
                url: item.link,
                publishedAt: item.pubDate,
                source: new URL(feedUrl).hostname
              }));
            
            allNews.push(...todayNews);
          }
        }
      } catch (feedError) {
        console.warn(`⚠️ Erreur avec le feed ${feedUrl}:`, feedError);
      }
    }

    // Sélectionner les 5 meilleures actualités du jour
    const topHeadlines = allNews
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);

    // Si pas assez d'actualités du jour, ajouter quelques actualités récentes
    if (topHeadlines.length < 3) {
      const recentNews: NewsItem[] = [
        {
          id: `fallback_${Date.now()}_1`,
          title: "Actualités du jour disponibles",
          summary: "Consultez les dernières actualités dans l'application LuvviX",
          url: "https://luvvix.com/news",
          publishedAt: new Date().toISOString(),
          source: "LuvviX"
        },
        {
          id: `fallback_${Date.now()}_2`,
          title: "Votre briefing quotidien vous attend",
          summary: "Découvrez les événements marquants de la journée",
          url: "https://luvvix.com/news",
          publishedAt: new Date().toISOString(),
          source: "LuvviX"
        }
      ];
      
      topHeadlines.push(...recentNews);
    }

    return topHeadlines.slice(0, 5);

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des actualités:", error);
    
    // Actualités de fallback
    return [
      {
        id: `emergency_${Date.now()}`,
        title: "Actualités du jour disponibles sur LuvviX",
        summary: "Consultez les dernières actualités dans votre application",
        url: "https://luvvix.com/news", 
        publishedAt: new Date().toISOString(),
        source: "LuvviX"
      }
    ];
  }
}