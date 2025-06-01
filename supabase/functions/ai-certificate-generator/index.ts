
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, courseId } = await req.json();

    // Vérifier l'achèvement du cours
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (!enrollment || enrollment.progress_percentage < 100) {
      throw new Error('Cours non terminé');
    }

    // Récupérer les données utilisateur
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Récupérer les résultats de quiz
    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('*, quizzes(*, lessons(*))')
      .eq('user_id', userId)
      .eq('quizzes.lessons.course_id', courseId);

    const averageScore = quizResults?.reduce((sum, result) => sum + result.score, 0) / (quizResults?.length || 1);

    // Générer le certificat avec l'IA
    const prompt = `Tu es LuvviX AI. Génère un certificat numérique personnalisé pour:

Utilisateur: ${userProfile?.full_name || 'Étudiant'}
Cours: ${enrollment.courses.title}
Score moyen: ${averageScore.toFixed(1)}%
Date d'achèvement: ${new Date().toLocaleDateString('fr-FR')}

Crée un certificat en JSON:
{
  "certificate_html": "<div style='...'> HTML complet du certificat avec style inline </div>",
  "achievement_level": "Excellent/Bien/Satisfaisant",
  "skills_acquired": ["compétence1", "compétence2"],
  "verification_text": "Texte de vérification officiel",
  "digital_signature": "Signature LuvviX AI Education Platform"
}

Le design doit être professionnel avec logo LuvviX, bordures élégantes, et style moderne.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5 }
      }),
    });

    const geminiData = await response.json();
    const generatedText = geminiData.candidates[0].content.parts[0].text;
    const certificateData = JSON.parse(generatedText.match(/\{[\s\S]*\}/)[0]);

    // Générer un code de vérification unique
    const verificationCode = `LUVVIX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Sauvegarder le certificat
    const { data: certificate } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_data: {
          ...certificateData,
          user_name: userProfile?.full_name,
          course_title: enrollment.courses.title,
          completion_date: new Date().toISOString(),
          average_score: averageScore,
          verification_code: verificationCode
        },
        verification_code: verificationCode
      })
      .select()
      .single();

    return new Response(JSON.stringify({ 
      success: true, 
      certificate: certificate
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur génération certificat:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
