
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Constants et types
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Types d'applications autorisées
const VALID_APPLICATIONS = ["main", "pharmacy", "streaming", "chat"];

// Log des requêtes
const logRequest = (path: string, userId: string | null, success: boolean) => {
  console.log(`[${new Date().toISOString()}] ${path} - User: ${userId || 'anonymous'} - Success: ${success}`);
};

// Types pour l'API
type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
};

// En-têtes CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, app-id, app-secret",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialiser le client Supabase avec la clé service (admin)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Extraire le chemin de l'URL pour déterminer quelle action effectuer
  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // 1. Vérifier le token JWT
    if (path === "verify-token") {
      const { token } = await req.json();
      
      if (!token) {
        return jsonResponse({ success: false, error: "Token manquant" }, 400);
      }
      
      // Vérifier le token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        logRequest("verify-token", null, false);
        return jsonResponse({ success: false, error: "Token invalide" }, 401);
      }
      
      logRequest("verify-token", user.id, true);
      return jsonResponse({ success: true, data: { valid: true, user_id: user.id } });
    }
    
    // 2. Obtenir les infos d'un utilisateur
    if (path === "get-user-info") {
      const { token } = await req.json();
      
      if (!token) {
        return jsonResponse({ success: false, error: "Token manquant" }, 400);
      }
      
      // Vérifier le token et obtenir l'utilisateur
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        logRequest("get-user-info", null, false);
        return jsonResponse({ success: false, error: "Token invalide" }, 401);
      }
      
      // Obtenir le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        logRequest("get-user-info", user.id, false);
        return jsonResponse({ success: false, error: "Profil non trouvé" }, 404);
      }
      
      logRequest("get-user-info", user.id, true);
      // Retourner les données utilisateur
      return jsonResponse({ 
        success: true, 
        data: {
          id: user.id,
          email: user.email,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          status: profile.status
        } 
      });
    }
    
    // 3. Autoriser une application
    if (path === "authorize-app") {
      const { token, app_name } = await req.json();
      
      if (!token || !app_name) {
        return jsonResponse({ 
          success: false, 
          error: "Token ou nom d'application manquant" 
        }, 400);
      }
      
      if (!VALID_APPLICATIONS.includes(app_name)) {
        return jsonResponse({ 
          success: false, 
          error: "Application non autorisée" 
        }, 400);
      }
      
      // Vérifier le token
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        logRequest("authorize-app", null, false);
        return jsonResponse({ success: false, error: "Token invalide" }, 401);
      }
      
      // Vérifier si l'accès existe déjà
      const { data: existingAccess } = await supabase
        .from('user_app_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', app_name)
        .single();
        
      if (existingAccess) {
        // Mettre à jour last_access
        await supabase
          .from('user_app_access')
          .update({ last_access: new Date().toISOString() })
          .eq('id', existingAccess.id);
          
        logRequest("authorize-app", user.id, true);
      } else {
        // Créer un nouvel accès
        await supabase
          .from('user_app_access')
          .insert({
            user_id: user.id,
            app_name: app_name,
          });
          
        logRequest("authorize-app", user.id, true);
      }
      
      return jsonResponse({ 
        success: true, 
        data: { 
          authorized: true,
          app_name: app_name,
          user_id: user.id
        } 
      });
    }
    
    // 4. Obtenir les applications associées à un utilisateur
    if (path === "get-user-apps") {
      const { token } = await req.json();
      
      if (!token) {
        return jsonResponse({ success: false, error: "Token manquant" }, 400);
      }
      
      // Vérifier le token
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        logRequest("get-user-apps", null, false);
        return jsonResponse({ success: false, error: "Token invalide" }, 401);
      }
      
      // Obtenir les applications associées à l'utilisateur
      const { data: apps, error: appsError } = await supabase
        .from('user_app_access')
        .select('*')
        .eq('user_id', user.id)
        .order('last_access', { ascending: false });
        
      if (appsError) {
        logRequest("get-user-apps", user.id, false);
        return jsonResponse({ success: false, error: "Erreur lors de la récupération des applications" }, 500);
      }
      
      logRequest("get-user-apps", user.id, true);
      return jsonResponse({ success: true, data: apps });
    }
    
    // 5. Révoquer l'accès d'une application
    if (path === "revoke-app") {
      const { token, app_access_id } = await req.json();
      
      if (!token || !app_access_id) {
        return jsonResponse({ 
          success: false, 
          error: "Token ou identifiant d'accès manquant" 
        }, 400);
      }
      
      // Vérifier le token
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        logRequest("revoke-app", null, false);
        return jsonResponse({ success: false, error: "Token invalide" }, 401);
      }
      
      // Vérifier que l'accès appartient bien à l'utilisateur avant de le supprimer
      const { data: access } = await supabase
        .from('user_app_access')
        .select('*')
        .eq('id', app_access_id)
        .eq('user_id', user.id)
        .single();
        
      if (!access) {
        logRequest("revoke-app", user.id, false);
        return jsonResponse({ 
          success: false, 
          error: "Accès non trouvé ou non autorisé" 
        }, 404);
      }
      
      // Supprimer l'accès
      const { error: deleteError } = await supabase
        .from('user_app_access')
        .delete()
        .eq('id', app_access_id);
        
      if (deleteError) {
        logRequest("revoke-app", user.id, false);
        return jsonResponse({ 
          success: false, 
          error: "Erreur lors de la suppression de l'accès" 
        }, 500);
      }
      
      logRequest("revoke-app", user.id, true);
      return jsonResponse({ 
        success: true, 
        data: { 
          revoked: true,
          app_access_id: app_access_id
        } 
      });
    }

    // 6. NOUVEL ENDPOINT: Générer un token d'accès pour une application
    if (path === "generate-app-token") {
      const { token, app_name } = await req.json();
      
      if (!token || !app_name) {
        return jsonResponse({ 
          success: false, 
          error: "Token ou nom d'application manquant" 
        }, 400);
      }
      
      if (!VALID_APPLICATIONS.includes(app_name)) {
        return jsonResponse({ 
          success: false, 
          error: "Application non autorisée" 
        }, 400);
      }
      
      // Vérifier le token utilisateur
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        logRequest("generate-app-token", null, false);
        return jsonResponse({ success: false, error: "Token utilisateur invalide" }, 401);
      }
      
      // Autoriser l'application automatiquement
      await supabase
        .from('user_app_access')
        .upsert({
          user_id: user.id,
          app_name: app_name,
          last_access: new Date().toISOString()
        }, { onConflict: 'user_id,app_name' });
      
      // Générer un token d'accès spécifique à l'application (ici on utilise JWT simple)
      const appToken = generateAppToken(user.id, app_name);
      
      logRequest("generate-app-token", user.id, true);
      return jsonResponse({ 
        success: true, 
        data: { 
          app_token: appToken,
          expires_in: 3600 // 1 heure par exemple
        } 
      });
    }
    
    // 7. NOUVEL ENDPOINT: Échanger un token d'application contre un token LuvviX ID
    if (path === "exchange-token") {
      const { app_token, app_name } = await req.json();
      
      if (!app_token || !app_name) {
        return jsonResponse({ 
          success: false, 
          error: "Token d'application ou nom d'application manquant" 
        }, 400);
      }
      
      // Vérifier et décoder le token d'application
      const decodedToken = verifyAppToken(app_token);
      
      if (!decodedToken || decodedToken.app_name !== app_name) {
        logRequest("exchange-token", null, false);
        return jsonResponse({ success: false, error: "Token d'application invalide" }, 401);
      }
      
      const userId = decodedToken.user_id;
      
      // Vérifier que l'utilisateur existe
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !user) {
        logRequest("exchange-token", null, false);
        return jsonResponse({ success: false, error: "Utilisateur introuvable" }, 404);
      }
      
      // Générer un token JWT pour l'utilisateur
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
        userId: userId,
        expiresIn: 3600 // 1 heure
      });
      
      if (sessionError) {
        logRequest("exchange-token", userId, false);
        return jsonResponse({ 
          success: false, 
          error: "Erreur lors de la création de la session" 
        }, 500);
      }
      
      logRequest("exchange-token", userId, true);
      return jsonResponse({ 
        success: true, 
        data: { 
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_at: sessionData.session.expires_at
        } 
      });
    }
    
    // Si le chemin n'est pas reconnu
    return jsonResponse({ success: false, error: "Endpoint non trouvé" }, 404);
  } catch (error) {
    console.error("Erreur:", error.message);
    return jsonResponse({ success: false, error: "Erreur serveur" }, 500);
  }
});

// Fonction utilitaire pour créer des réponses JSON formatées
function jsonResponse(body: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders },
  });
}

// Fonctions utilitaires pour la génération et vérification des tokens d'application
// Note: dans un environnement de production, utilisez une méthode plus sécurisée
function generateAppToken(userId: string, appName: string): string {
  const payload = {
    user_id: userId,
    app_name: appName,
    exp: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1 heure
    iat: Math.floor(Date.now() / 1000)
  };
  
  // En production, utilisez une bibliothèque JWT appropriée
  // Pour cette démo, on encode simplement en base64
  return btoa(JSON.stringify(payload));
}

function verifyAppToken(token: string): { user_id: string; app_name: string } | null {
  try {
    const decoded = JSON.parse(atob(token));
    
    // Vérifier l'expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      user_id: decoded.user_id,
      app_name: decoded.app_name
    };
  } catch (e) {
    return null;
  }
}
