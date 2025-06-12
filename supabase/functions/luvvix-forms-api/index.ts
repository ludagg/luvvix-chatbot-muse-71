
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean);

  try {
    // GET /forms - List public forms
    if (req.method === 'GET' && path.length === 0) {
      const { data: forms, error } = await supabase
        .from('forms')
        .select('id, title, description, created_at, published')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        data: forms
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /forms/{id} - Get specific form with questions
    if (req.method === 'GET' && path.length === 1) {
      const formId = path[0];

      const [formResult, questionsResult] = await Promise.all([
        supabase
          .from('forms')
          .select('*')
          .eq('id', formId)
          .eq('published', true)
          .single(),
        supabase
          .from('form_questions')
          .select('*')
          .eq('form_id', formId)
          .order('position', { ascending: true })
      ]);

      if (formResult.error) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Form not found or not published'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (questionsResult.error) throw questionsResult.error;

      console.log(`Form ${formId} retrieved with ${questionsResult.data.length} questions`);

      return new Response(JSON.stringify({
        success: true,
        data: {
          form: formResult.data,
          questions: questionsResult.data
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /forms/{id}/submit - Submit form response
    if (req.method === 'POST' && path.length === 2 && path[1] === 'submit') {
      const formId = path[0];
      const { answers, responder_email } = await req.json();

      if (!answers) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required parameter: answers'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if form exists and is published
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('published, settings')
        .eq('id', formId)
        .single();

      if (formError || !form?.published) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Form not found or not published'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check submission limits
      const settings = form.settings as any || {};
      if (settings.maxResponses) {
        const { count, error: countError } = await supabase
          .from('form_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('form_id', formId);
          
        if (countError) throw countError;
        
        if (count && count >= settings.maxResponses) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Form has reached maximum number of responses'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Check if form is closed
      if (settings.closesAt && new Date(settings.closesAt) < new Date()) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Form is closed for submissions'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Submit the response
      const { data: submission, error: submitError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          responder_email: responder_email || null,
          answers
        })
        .select()
        .single();

      if (submitError) throw submitError;

      console.log(`Form submission created: ${submission.id}`);

      return new Response(JSON.stringify({
        success: true,
        data: {
          submission_id: submission.id,
          message: 'Form submitted successfully'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({
      success: false,
      error: 'Route not found'
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Forms API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
