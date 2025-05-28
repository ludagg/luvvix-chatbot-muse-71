
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
    const GROQ_API_KEY = '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';
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    const { projectName, projectDescription, codeBase, documentationType, format } = await req.json();

    const docPrompt = `
Créez une documentation professionnelle et complète pour le projet "${projectName}" avec les spécifications suivantes:

Description du projet: ${projectDescription}
Type de documentation: ${documentationType}
Format de sortie: ${format}

${codeBase ? `Code source à analyser:\n\`\`\`\n${codeBase}\n\`\`\`` : ''}

La documentation doit inclure:
1. Introduction claire et accrocheuse
2. Table des matières
3. Guide d'installation détaillé
4. Guide d'utilisation avec exemples
5. Documentation API (si applicable)
6. Configuration et paramétrage
7. Exemples de code pratiques
8. Guide de déploiement
9. Troubleshooting et FAQ
10. Contribution et développement

${format === 'markdown' ? 'Utilisez la syntaxe Markdown avec des titres, listes, code blocks, et liens.' : ''}
${format === 'html' ? 'Générez du HTML5 sémantique avec des classes CSS pour le styling.' : ''}
${format === 'confluence' ? 'Utilisez la syntaxe Confluence Wiki avec macros appropriées.' : ''}

Retournez le résultat en JSON:
{
  "title": "Titre de la documentation",
  "content": "Contenu complet de la documentation",
  "sections": [
    {
      "title": "Nom de la section",
      "content": "Contenu de la section",
      "type": "introduction|installation|usage|api|examples|troubleshooting"
    }
  ],
  "format": "${format}",
  "estimatedReadTime": "temps de lecture estimé"
}

Soyez très détaillé et professionnel. La documentation doit être prête pour la production.
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-versatile',
        messages: [{
          role: 'user',
          content: docPrompt
        }],
        temperature: 0.3,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const docContent = data.choices?.[0]?.message?.content;

    if (!docContent) {
      throw new Error('No documentation generated');
    }

    // Extract JSON from the response
    const jsonMatch = docContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const documentation = JSON.parse(jsonMatch[0]);

    // Améliorer avec Gemini si disponible
    if (GEMINI_API_KEY && codeBase) {
      const enhancementPrompt = `
Analysez ce code source et suggérez des améliorations pour la documentation:

\`\`\`
${codeBase}
\`\`\`

Documentation actuelle: ${documentation.title}

Retournez des suggestions d'amélioration en JSON:
{
  "codeAnalysis": "Analyse du code",
  "suggestions": [
    "suggestion 1",
    "suggestion 2"
  ],
  "additionalSections": [
    {
      "title": "Nouvelle section",
      "content": "Contenu suggéré"
    }
  ]
}
`;

      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: enhancementPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2000,
            }
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const enhancementContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (enhancementContent) {
            const enhancementMatch = enhancementContent.match(/\{[\s\S]*\}/);
            if (enhancementMatch) {
              const enhancements = JSON.parse(enhancementMatch[0]);
              documentation.enhancements = enhancements;
            }
          }
        }
      } catch (error) {
        console.log('Gemini enhancement failed:', error);
      }
    }

    // Ajouter des métadonnées
    documentation.id = crypto.randomUUID();
    documentation.createdAt = new Date().toISOString();
    documentation.projectName = projectName;
    documentation.aiGenerated = true;
    documentation.wordCount = documentation.content.split(' ').length;

    return new Response(JSON.stringify({ 
      success: true, 
      documentation 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating documentation:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
