
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Cette fonction initialise un bucket de stockage pour le cloud si nécessaire
Deno.serve(async (req) => {
  // Gérer les requêtes CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
      },
    })
  }
  
  try {
    // Créer un client Supabase en utilisant les informations d'environnement
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    console.log('Checking if cloud storage bucket exists...')
    
    // Vérifier si le bucket existe déjà
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      throw listError
    }
    
    const cloudBucket = buckets?.find(bucket => bucket.name === 'cloud')
    const metadataBucket = buckets?.find(bucket => bucket.name === 'metadata')
    
    let createdBucket = false
    
    if (!cloudBucket) {
      console.log('Cloud bucket does not exist. Creating...')
      
      // Créer le bucket de stockage principal
      const { data, error } = await supabaseAdmin.storage.createBucket('cloud', {
        public: true,
        fileSizeLimit: 100 * 1024 * 1024, // 100 MB limite
        allowedMimeTypes: ['*/*'] // Tous les types MIME
      })
      
      if (error) {
        throw error
      }
      
      console.log('Cloud bucket created successfully:', data)
      createdBucket = true
    }
    
    if (!metadataBucket) {
      console.log('Metadata bucket does not exist. Creating...')
      
      // Créer le bucket pour les métadonnées
      const { data, error } = await supabaseAdmin.storage.createBucket('metadata', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5 MB limite pour les métadonnées
        allowedMimeTypes: ['application/json'] // Uniquement JSON
      })
      
      if (error) {
        throw error
      }
      
      console.log('Metadata bucket created successfully:', data)
      createdBucket = true
    }
    
    if (createdBucket) {
      return new Response(
        JSON.stringify({ success: true, message: 'Storage buckets created' }),
        {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 200
        }
      )
    }
    
    console.log('All required buckets already exist')
    return new Response(
      JSON.stringify({ success: true, message: 'Storage buckets already exist' }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Error in setup-storage function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 500
      }
    )
  }
})
