
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "https://esm.sh/@simplewebauthn/server@10.0.0";
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "https://esm.sh/@simplewebauthn/server@10.0.0";

// Constants et types
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// WebAuthn Configuration
const RP_ID = Deno.env.get("WEBAUTHN_RP_ID") || "luvvix.it.com";
const RP_NAME = Deno.env.get("WEBAUTHN_RP_NAME") || "LuvviX ID";
const ORIGIN = Deno.env.get("WEBAUTHN_ORIGIN") || `https://${RP_ID}`;

// Challenge timeout (e.g., 5 minutes)
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

// Helper to convert ArrayBuffer to hex string for BYTEA
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper to convert hex string (from BYTEA) to Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
  if (hexString.startsWith("\\x")) {
    hexString = hexString.substring(2);
  }
  const length = hexString.length;
  const buffer = new Uint8Array(length / 2);
  for (let i = 0; i < length; i += 2) {
    buffer[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return buffer;
}

// Helper to convert string to Uint8Array for userID
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

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

// Helper function to check if tables exist
async function ensureTablesExist(supabase: SupabaseClient) {
  try {
    // Try to query the tables to see if they exist
    const { error: challengeError } = await supabase.from("webauthn_challenges").select("id").limit(1);
    const { error: credentialError } = await supabase.from("user_webauthn_credentials").select("id").limit(1);
    
    if (challengeError || credentialError) {
      console.error("Database tables missing. Please run the WebAuthn migration:", {
        challengeError: challengeError?.message,
        credentialError: credentialError?.message
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking tables:", error);
    return false;
  }
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialiser le client Supabase avec la clé service (admin)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Extraire le chemin de l'URL pour déterminer quelle action effectuer
  const url = new URL(req.url);
  const requestPath = url.pathname.replace(/^\/auth-api/, ""); 

  try {
    // Clean up expired challenges (could be a cron job in a real app)
    await supabase.from("webauthn_challenges").delete().lt("expires_at", new Date().toISOString());

    // 1. Vérifier le token JWT
    if (requestPath === "/verify-token") {
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
    if (requestPath === "/get-user-info") {
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
    if (requestPath === "/authorize-app") {
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
    if (requestPath === "/get-user-apps") {
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
    if (requestPath === "/revoke-app") {
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
    if (requestPath === "/generate-app-token") {
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
    if (requestPath === "/exchange-token") {
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

    // --- WebAuthn Endpoints ---

    // 8. WebAuthn - Start Registration
    if (requestPath === "/webauthn/register/start" && req.method === "POST") {
      // Check if tables exist first
      const tablesExist = await ensureTablesExist(supabase);
      if (!tablesExist) {
        return jsonResponse({ 
          success: false, 
          error: "Database not properly configured. Please ensure WebAuthn tables are created." 
        }, 500);
      }

      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return jsonResponse({ success: false, error: "Missing or invalid token" }, 401);
      }
      const token = authHeader.split(" ")[1];
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        logRequest(requestPath, null, false);
        return jsonResponse({ success: false, error: "Invalid token" }, 401);
      }

      try {
        const { data: existingCredentials, error: credError } = await supabase
          .from("user_webauthn_credentials")
          .select("credential_id")
          .eq("user_id", user.id);

        if (credError) {
          console.error("Error querying credentials:", credError);
          logRequest(requestPath, user.id, false);
          return jsonResponse({ success: false, error: "Failed to query credentials: " + credError.message }, 500);
        }

        const opts: GenerateRegistrationOptionsOpts = {
          rpName: RP_NAME,
          rpID: RP_ID,
          userID: stringToUint8Array(user.id), // Convert string to Uint8Array
          userName: user.email || `user-${user.id}`,
          attestationType: "none",
          excludeCredentials: existingCredentials?.map(cred => ({
            id: cred.credential_id,
            type: 'public-key',
          })) || [],
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
            requireResidentKey: false,
          },
        };
        const options = await generateRegistrationOptions(opts);

        // Store challenge
        const expires_at = new Date(Date.now() + CHALLENGE_EXPIRY_MS).toISOString();
        const { error: challengeError } = await supabase
          .from("webauthn_challenges")
          .insert({ user_id: user.id, challenge: options.challenge, expires_at });

        if (challengeError) {
          console.error("Error storing challenge:", challengeError);
          logRequest(requestPath, user.id, false);
          return jsonResponse({ success: false, error: "Failed to store challenge: " + challengeError.message }, 500);
        }
        
        logRequest(requestPath, user.id, true);
        return jsonResponse({ success: true, data: options });
      } catch (error) {
        console.error("Error in registration start:", error);
        logRequest(requestPath, user.id, false);
        return jsonResponse({ success: false, error: "Registration setup failed: " + error.message }, 500);
      }
    }

    // 9. WebAuthn - Finish Registration
    if (requestPath === "/webauthn/register/finish" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return jsonResponse({ success: false, error: "Missing or invalid token" }, 401);
      }
      const token = authHeader.split(" ")[1];
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        logRequest(requestPath, null, false);
        return jsonResponse({ success: false, error: "Invalid token" }, 401);
      }

      const attestationResponse: RegistrationResponseJSON = await req.json();

      const { data: challengeData, error: challengeFetchError } = await supabase
        .from("webauthn_challenges")
        .select("challenge")
        .eq("user_id", user.id)
        // .eq("challenge", attestationResponse.challenge) // SimpleWebAuthn will verify challenge
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (challengeFetchError || !challengeData) {
        logRequest(requestPath, user.id, false);
        return jsonResponse({ success: false, error: "Challenge not found or expired" }, 400);
      }
      
      const expectedChallenge = challengeData.challenge;

      let verification: VerifiedRegistrationResponse;
      try {
        const opts: VerifyRegistrationResponseOpts = {
          response: attestationResponse,
          expectedChallenge: `${expectedChallenge}`, // Ensure it's a string
          expectedOrigin: ORIGIN,
          expectedRPID: RP_ID,
          requireUserVerification: true, // Recommended
        };
        verification = await verifyRegistrationResponse(opts);
      } catch (error) {
        logRequest(requestPath, user.id, false);
        return jsonResponse({ success: false, error: `Verification failed: ${error.message}` }, 400);
      }

      if (verification.verified && verification.registrationInfo) {
        const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
        
        const newCredential = {
          user_id: user.id,
          credential_id: credentialID, // Already base64url string
          public_key: `\\x${arrayBufferToHex(credentialPublicKey)}`, // Convert ArrayBuffer to hex for BYTEA
          sign_count: counter,
          transports: attestationResponse.response.transports || [],
          friendly_name: `Authenticator @ ${new Date().toLocaleDateString()}`, // Placeholder
        };

        const { error: insertError } = await supabase
          .from("user_webauthn_credentials")
          .insert(newCredential);

        if (insertError) {
          logRequest(requestPath, user.id, false);
          return jsonResponse({ success: false, error: "Could not save credential: " + insertError.message }, 500);
        }

        // Clean up challenge
        await supabase.from("webauthn_challenges").delete().eq("challenge", expectedChallenge);
        
        // Update user metadata to indicate they have WebAuthn credentials
        await supabase.auth.admin.updateUserById(user.id, {
          app_metadata: { has_webauthn_credentials: true }
        });
        
        logRequest(requestPath, user.id, true);
        return jsonResponse({ success: true, data: { verified: true } });
      } else {
        logRequest(requestPath, user.id, false);
        return jsonResponse({ success: false, error: "Cannot verify registration" }, 400);
      }
    }

    // 10. WebAuthn - Start Login
    if (requestPath === "/webauthn/login/start" && req.method === "POST") {
      // For login, user might not be authenticated yet, or could be re-authenticating.
      // If re-authenticating, token might be present. If initiating login, email/username might be sent.
      // For this example, let's assume email is provided to identify the user.
      const { email } = await req.json();
      if (!email) {
        return jsonResponse({ success: false, error: "Email is required to start login" }, 400);
      }

      // Find user by email using admin function
      const { data: { users }, error: userLookupError } = await supabase.auth.admin.listUsers();

      if (userLookupError) {
        logRequest(requestPath, `email: ${email}`, false);
        return jsonResponse({ success: false, error: "Error looking up user" }, 500);
      }

      const user = users?.find(u => u.email === email);
      if (!user) {
        logRequest(requestPath, `email: ${email}`, false);
        return jsonResponse({ success: false, error: "User not found" }, 404);
      }
      
      const userId = user.id;
      
      const { data: userCredentials, error: credError } = await supabase
        .from("user_webauthn_credentials")
        .select("credential_id, transports")
        .eq("user_id", userId);

      if (credError) {
        logRequest(requestPath, userId, false);
        return jsonResponse({ success: false, error: "Failed to query credentials" }, 500);
      }

      const opts: GenerateAuthenticationOptionsOpts = {
        rpID: RP_ID,
        allowCredentials: userCredentials?.map(cred => ({
          id: cred.credential_id,
          type: 'public-key',
          transports: cred.transports as any[] || undefined, // Pass transports if available
        })) || [],
        userVerification: "preferred",
      };
      const options = await generateAuthenticationOptions(opts);

      // Store challenge
      const expires_at = new Date(Date.now() + CHALLENGE_EXPIRY_MS).toISOString();
      const { error: challengeError } = await supabase
        .from("webauthn_challenges")
        .insert({ user_id: userId, challenge: options.challenge, expires_at });
      
      if (challengeError) {
        logRequest(requestPath, userId, false);
        return jsonResponse({ success: false, error: "Failed to store challenge: " + challengeError.message }, 500);
      }

      logRequest(requestPath, userId, true);
      return jsonResponse({ success: true, data: options });
    }

    // 11. WebAuthn - Finish Login
    if (requestPath === "/webauthn/login/finish" && req.method === "POST") {
      const assertionResponse: AuthenticationResponseJSON = await req.json();
      const credentialId = assertionResponse.id; // This is the credential_id used for lookup

      // User ID might be in the assertionResponse.response.userHandle if resident keys are used
      // Or, we might need to look up user by credentialId first
      let userId = assertionResponse.response.userHandle; // UserHandle might be the userID string

      if (!userId) {
        // If userHandle is not available, try to find user by credentialId
        const { data: credForUserLookup, error: lookupError } = await supabase
          .from('user_webauthn_credentials')
          .select('user_id')
          .eq('credential_id', credentialId)
          .single();
        if (lookupError || !credForUserLookup) {
            logRequest(requestPath, `credId: ${credentialId} (no userHandle)`, false);
            return jsonResponse({ success: false, error: "Credential not found or userHandle missing" }, 400);
        }
        userId = credForUserLookup.user_id;
      }
      
      if (!userId) { // Final check if userId was determined
        logRequest(requestPath, `credId: ${credentialId}`, false);
        return jsonResponse({ success: false, error: "Could not determine user for login" }, 400);
      }


      const { data: challengeData, error: challengeFetchError } = await supabase
        .from("webauthn_challenges")
        .select("challenge")
        .eq("user_id", userId) // UserID must be known here
        // .eq("challenge", assertionResponse.challenge) // SimpleWebAuthn will verify
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (challengeFetchError || !challengeData) {
        logRequest(requestPath, userId, false);
        return jsonResponse({ success: false, error: "Challenge not found or expired for user" }, 400);
      }
      const expectedChallenge = challengeData.challenge;

      const { data: authenticator, error: authDbError } = await supabase
        .from("user_webauthn_credentials")
        .select("credential_id, public_key, sign_count, user_id")
        .eq("credential_id", credentialId)
        .eq("user_id", userId) // Ensure credential belongs to this user
        .single();
      
      if (authDbError || !authenticator) {
        logRequest(requestPath, userId, false);
        return jsonResponse({ success: false, error: "Authenticator not found for user" }, 404);
      }

      let verification: VerifiedAuthenticationResponse;
      try {
        const opts: VerifyAuthenticationResponseOpts = {
          response: assertionResponse,
          expectedChallenge: `${expectedChallenge}`,
          expectedOrigin: ORIGIN,
          expectedRPID: RP_ID,
          authenticator: {
            credentialID: authenticator.credential_id,
            credentialPublicKey: hexToUint8Array(authenticator.public_key as string), // Convert hex from DB to Uint8Array
            counter: authenticator.sign_count,
            // transports: authenticator.transports, // Optional
          },
          requireUserVerification: true, // Recommended
        };
        verification = await verifyAuthenticationResponse(opts);
      } catch (error) {
        logRequest(requestPath, userId, false);
        console.error("Verification error details:", error);
        return jsonResponse({ success: false, error: `Verification failed: ${error.message}` }, 400);
      }

      if (verification.verified && verification.authenticationInfo) {
        const { newCounter } = verification.authenticationInfo;
        const { error: updateError } = await supabase
          .from("user_webauthn_credentials")
          .update({ sign_count: newCounter, last_used_at: new Date().toISOString() })
          .eq("credential_id", credentialId);

        if (updateError) {
          // Log error but proceed with login as verification was successful
          console.error(`Failed to update sign_count for ${credentialId}: ${updateError.message}`);
        }

        // Clean up challenge
        await supabase.from("webauthn_challenges").delete().eq("challenge", expectedChallenge);

        // Generate a Supabase session JWT for the user
        // Note: This uses admin privileges. Ensure this is the desired behavior.
        // If you want the user to get a session for their own user, they should typically
        // re-authenticate with a password or other primary factor if this is a second factor.
        // Or, if WebAuthn is a primary MFA, this is the point to issue the session.
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
            userId: authenticator.user_id, // Use the user_id from the authenticator record
        });

        if (sessionError) {
            logRequest(requestPath, authenticator.user_id, false);
            return jsonResponse({ success: false, error: "Failed to create session: " + sessionError.message }, 500);
        }
        
        logRequest(requestPath, authenticator.user_id, true);
        return jsonResponse({ 
            success: true, 
            data: { 
                verified: true, 
                user_id: authenticator.user_id,
                access_token: sessionData.session.access_token,
                refresh_token: sessionData.session.refresh_token,
                expires_at: sessionData.session.expires_at
            } 
        });
      } else {
        logRequest(requestPath, userId, false);
        return jsonResponse({ success: false, error: "Cannot verify authentication" }, 400);
      }
    }

    // 12. WebAuthn - List Credentials
    if (requestPath === "/webauthn/credentials/list" && req.method === "GET") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return jsonResponse({ success: false, error: "Missing or invalid token" }, 401);
      }
      const token = authHeader.split(" ")[1];
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        logRequest(requestPath, null, false);
        return jsonResponse({ success: false, error: "Invalid token" }, 401);
      }

      const { data: credentials, error: listError } = await supabase
        .from("user_webauthn_credentials")
        .select("id, credential_id, friendly_name, created_at, last_used_at, transports")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (listError) {
        logRequest(requestPath, user.id, false);
        console.error("Error listing credentials:", listError.message);
        return jsonResponse({ success: false, error: "Failed to list credentials: " + listError.message }, 500);
      }
      
      logRequest(requestPath, user.id, true);
      return jsonResponse({ success: true, data: credentials || [] });
    }

    // 13. WebAuthn - Delete Credential
    if (requestPath === "/webauthn/credentials/delete" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return jsonResponse({ success: false, error: "Missing or invalid token" }, 401);
      }
      const token = authHeader.split(" ")[1];
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        logRequest(requestPath, null, false);
        return jsonResponse({ success: false, error: "Invalid token" }, 401);
      }

      const { credential_db_id } = await req.json(); // Expecting the database UUID id of the credential

      if (!credential_db_id) {
        logRequest(requestPath, user.id, false);
        return jsonResponse({ success: false, error: "Credential database ID is required" }, 400);
      }

      // Verify the credential belongs to the user and delete it
      const { error: deleteError, count } = await supabase
        .from("user_webauthn_credentials")
        .delete({ count: 'exact' }) // Ensure count is returned
        .eq("user_id", user.id)
        .eq("id", credential_db_id); // Match against the database primary key 'id'

      if (deleteError) {
        logRequest(requestPath, user.id, false);
        console.error(`Error deleting credential ${credential_db_id}:`, deleteError.message);
        return jsonResponse({ success: false, error: `Failed to delete credential: ${deleteError.message}` }, 500);
      }

      if (count === 0) {
        logRequest(requestPath, user.id, false);
        return jsonResponse({ success: false, error: "Credential not found or not owned by user" }, 404);
      }
      
      // Optionally, update user metadata if needed (e.g., has_webauthn_credentials flag)
      // This might be better handled by a trigger or checking count after deletion.
      const { data: remainingCredentials, error: checkError } = await supabase
        .from("user_webauthn_credentials")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      if (!checkError && remainingCredentials.length === 0) {
         await supabase.auth.admin.updateUserById(user.id, {
            app_metadata: { has_webauthn_credentials: false }
         });
         logRequest(requestPath, user.id, true);
         console.log(`User ${user.id} no longer has WebAuthn credentials, metadata updated.`);
      }


      logRequest(requestPath, user.id, true);
      return jsonResponse({ success: true, message: "Credential deleted successfully" });
    }
    
    // Si le chemin n'est pas reconnu
    return jsonResponse({ success: false, error: `Endpoint ${requestPath} not found` }, 404);
  } catch (error) {
    console.error(`Error processing ${url.pathname}:`, error.message, error.stack);
    return jsonResponse({ success: false, error: "Internal Server Error" }, 500);
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
