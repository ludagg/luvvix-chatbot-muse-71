
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get query parameters
    const url = new URL(req.url);
    const frequencyParam = url.searchParams.get('frequency') || 'daily';
    const frequency = ['daily', 'weekly', 'realtime'].includes(frequencyParam) 
      ? frequencyParam as 'daily' | 'weekly' | 'realtime'
      : 'daily';
    
    console.log(`Sending ${frequency} newsletters...`);

    // Get latest news for the newsletter
    const { data: newsData, error: newsError } = await supabase.functions.invoke('get-news', {
      body: { category: 'all', max: 5 },
    });

    if (newsError) {
      console.error('Error fetching news:', newsError);
      throw new Error(`Failed to fetch news: ${newsError.message || newsError}`);
    }

    // Get subscribers with matching frequency preferences
    const { data: subscribers, error: subscribersError } = await supabase
      .from("news_subscriptions")
      .select("*")
      .eq('preferences->frequency', frequency);
    
    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }

    console.log(`Found ${subscribers?.length || 0} subscribers for ${frequency} frequency`);
    
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ 
        message: `No subscribers found for ${frequency} frequency` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Prepare the newsletter HTML
    const generateNewsletterHtml = (items, topics) => {
      // Filter news by user topics if specified
      const newsItems = topics && topics.length > 0
        ? items.filter(item => {
            const itemLower = (item.title + ' ' + item.summary).toLowerCase();
            return topics.some(topic => itemLower.includes(topic.toLowerCase()));
          })
        : items;
      
      // If no matching news after filtering, use all news
      const finalItems = newsItems.length > 0 ? newsItems : items;
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>LuvviX Newsletter</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2d3748; }
            h2 { color: #4a5568; margin-top: 30px; }
            .news-item { margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
            .news-item:last-child { border-bottom: none; }
            .news-title { color: #2c5282; text-decoration: none; font-weight: bold; }
            .news-title:hover { text-decoration: underline; }
            .news-source { color: #718096; font-size: 0.9em; }
            .news-summary { margin-top: 8px; }
            .footer { margin-top: 30px; font-size: 0.8em; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .button { display: inline-block; background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>LuvviX Newsletter</h1>
          <p>Voici les dernières actualités qui pourraient vous intéresser :</p>
          
          <div class="news-container">
            ${finalItems.map(item => `
              <div class="news-item">
                <a href="${item.url}" class="news-title">${item.title}</a>
                <div class="news-source">Source: ${item.source} - ${new Date(item.publishedAt).toLocaleDateString('fr-FR')}</div>
                <div class="news-summary">${item.summary}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>
              Vous recevez cet email car vous êtes abonné à la newsletter LuvviX.
              <br>
              <a href="${supabaseUrl}/unsubscribe?id={{subscriberId}}">Se désabonner</a>
            </p>
          </div>
        </body>
        </html>
      `;
    };

    // Send emails to each subscriber
    const sendResults = await Promise.allSettled(
      subscribers.map(async (subscriber) => {
        try {
          const html = generateNewsletterHtml(
            newsData?.items || [], 
            subscriber.topics || []
          );

          const result = await resend.emails.send({
            from: "LuvviX Newsletter <newsletter@luvvix.com>",
            to: [subscriber.email],
            subject: `Newsletter LuvviX ${new Date().toLocaleDateString('fr-FR')}`,
            html: html.replace('{{subscriberId}}', subscriber.id),
          });

          console.log(`Email sent to ${subscriber.email}:`, result);
          return result;
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          return { error, subscriber: subscriber.email };
        }
      })
    );

    const successful = sendResults.filter(r => r.status === 'fulfilled').length;
    const failed = sendResults.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successful} newsletters, ${failed} failed`,
        frequency,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Newsletter error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send newsletters",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
