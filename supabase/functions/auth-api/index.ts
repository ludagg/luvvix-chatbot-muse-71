
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Base API keys for third-party services
const API_KEYS = [
  'luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6',
  'luvvix_api_sk_live_61A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7',
  'luvvix_api_sk_live_71B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8',
  'luvvix_api_sk_live_81C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9',
  'luvvix_api_sk_live_91D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0',
  'luvvix_api_sk_live_01E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1',
  'luvvix_api_sk_live_11F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2',
  'luvvix_api_sk_live_21G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3',
  'luvvix_api_sk_live_31H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4',
  'luvvix_api_sk_live_41I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5'
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const pathname = url.pathname

    // Authenticate third-party service
    if (pathname === '/auth-api/authenticate') {
      return await handleAuthenticate(req, supabaseClient)
    }

    // Verify token validity
    if (pathname === '/auth-api/verify-token') {
      return await handleVerifyToken(req, supabaseClient)
    }

    // Get user information
    if (pathname === '/auth-api/get-user-info') {
      return await handleGetUserInfo(req, supabaseClient)
    }

    // Get available API keys
    if (pathname === '/auth-api/get-api-keys') {
      return await handleGetApiKeys(req)
    }

    // Register new service
    if (pathname === '/auth-api/register-service') {
      return await handleRegisterService(req, supabaseClient)
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auth API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleAuthenticate(req: Request, supabaseClient: any) {
  const { email, password, service_key } = await req.json()

  // Verify service API key
  if (!API_KEYS.includes(service_key)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid service API key' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Authenticate user
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get user profile
  const { data: profile } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: profile?.full_name,
          username: profile?.username,
          avatar_url: profile?.avatar_url
        }
      }
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleVerifyToken(req: Request, supabaseClient: any) {
  const { token } = await req.json()

  try {
    const { data, error } = await supabaseClient.auth.getUser(token)

    if (error) {
      return new Response(
        JSON.stringify({ success: false, valid: false, error: error.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          valid: true,
          user_id: data.user.id,
          email: data.user.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, valid: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetUserInfo(req: Request, supabaseClient: any) {
  const { token } = await req.json()

  try {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError) {
      return new Response(
        JSON.stringify({ success: false, error: userError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: userData.user.id,
          email: userData.user.email,
          full_name: profile?.full_name,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          created_at: userData.user.created_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid token' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetApiKeys(req: Request) {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        api_keys: API_KEYS,
        count: API_KEYS.length,
        note: "Use any of these API keys as 'service_key' parameter"
      }
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRegisterService(req: Request, supabaseClient: any) {
  const { service_name, service_url, service_key, redirect_uris = [] } = await req.json()

  // Verify service API key
  if (!API_KEYS.includes(service_key)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid service API key' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Register the service in the application table
    const { data, error } = await supabaseClient
      .from('application')
      .insert([{
        name: service_name,
        description: `Service registered via LuvviX Auth API`,
        redirecturis: redirect_uris
      }])
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          service_id: data.id,
          client_id: data.clientid,
          client_secret: data.clientsecret,
          oauth_url: `https://luvvix.it.com/oauth/authorize?client_id=${data.clientid}&response_type=code&redirect_uri=YOUR_REDIRECT_URI`
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Registration failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
