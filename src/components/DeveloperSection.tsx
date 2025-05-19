import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Server } from "lucide-react";
import { useEffect, useState } from "react";

const DeveloperSection = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [npmCopied, setNpmCopied] = useState(false);
  const [apiUrlCopied, setApiUrlCopied] = useState(false);

  // Reset copy states after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  useEffect(() => {
    if (npmCopied) {
      const timeout = setTimeout(() => setNpmCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [npmCopied]);

  useEffect(() => {
    if (apiUrlCopied) {
      const timeout = setTimeout(() => setApiUrlCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [apiUrlCopied]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
  };

  const copyNpmCommand = () => {
    navigator.clipboard.writeText("npm install luvvix-id");
    setNpmCopied(true);
  };

  const copyApiUrl = () => {
    navigator.clipboard.writeText("https://api.luvvix.com/v1");
    setApiUrlCopied(true);
  };

  return (
    <section id="developer" className="py-20 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Pour les développeurs</h2>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Intégrez facilement LuvviX ID dans votre application avec notre SDK ou notre API REST
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="sdk" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="sdk">SDK</TabsTrigger>
              <TabsTrigger value="rest">API REST</TabsTrigger>
            </TabsList>

            <TabsContent value="sdk">
              {/* SDK Installation */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Code className="mr-2 text-purple-600" size={20} />
                    Installation du SDK
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={copyNpmCommand}
                  >
                    {npmCopied ? (
                      <>
                        <Check size={14} />
                        <span>Copié!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copier</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                  npm install luvvix-id
                </div>
                
                <p className="text-gray-700 text-sm mb-4">
                  Le SDK LuvviX ID est disponible sur npm et facilite l'intégration de l'authentification dans votre application front-end.
                </p>
                
                {/* Code Examples */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Code className="mr-2 text-purple-600" size={20} />
                    Exemples d'intégration
                  </h3>
                  
                  <Tabs defaultValue="javascript">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="react">React</TabsTrigger>
                      <TabsTrigger value="vue">Vue.js</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="javascript" className="relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(javascriptExample, "js")}
                        className="absolute top-2 right-2 flex items-center space-x-1 z-10"
                      >
                        {copied === "js" ? (
                          <>
                            <Check size={14} />
                            <span>Copié!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copier</span>
                          </>
                        )}
                      </Button>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                        {javascriptExample}
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="react" className="relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(reactExample, "react")}
                        className="absolute top-2 right-2 flex items-center space-x-1 z-10"
                      >
                        {copied === "react" ? (
                          <>
                            <Check size={14} />
                            <span>Copié!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copier</span>
                          </>
                        )}
                      </Button>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                        {reactExample}
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="vue" className="relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(vueExample, "vue")}
                        className="absolute top-2 right-2 flex items-center space-x-1 z-10"
                      >
                        {copied === "vue" ? (
                          <>
                            <Check size={14} />
                            <span>Copié!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copier</span>
                          </>
                        )}
                      </Button>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                        {vueExample}
                      </pre>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-8 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Documentation complète</h4>
                    <p className="text-gray-700 text-sm mb-4">
                      Pour une documentation complète avec tous les endpoints, paramètres et exemples de code, consultez notre page de documentation API.
                    </p>
                    <Button 
                      variant="outline" 
                      className="flex items-center"
                      onClick={() => window.location.href = "/api-docs"}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Voir la documentation API
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rest">
              {/* REST API Documentation */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Server className="mr-2 text-purple-600" size={20} />
                    API REST
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={copyApiUrl}
                  >
                    {apiUrlCopied ? (
                      <>
                        <Check size={14} />
                        <span>Copié!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copier</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                  Base URL: https://api.luvvix.com/v1
                </div>

                <div className="space-y-8">
                  {/* Authentication */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Authentification</h4>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Toutes les requêtes à l'API doivent inclure votre clé d'API dans l'en-tête :
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        {`Authorization: Bearer YOUR_API_KEY`}
                      </pre>
                    </div>
                  </div>

                  {/* Endpoints */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Endpoints principaux</h4>
                    
                    {/* Verify Token */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-2">Vérifier un token</h5>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`POST /auth/verify
Content-Type: application/json

{
  "token": "user_access_token"
}`}
                      </pre>
                    </div>

                    {/* Get User Info */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-2">Obtenir les informations utilisateur</h5>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`GET /users/me
Authorization: Bearer user_access_token`}
                      </pre>
                    </div>

                    {/* Revoke Token */}
                    <div>
                      <h5 className="font-medium mb-2">Révoquer un token</h5>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`POST /auth/revoke
Content-Type: application/json

{
  "token": "user_access_token"
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Response Examples */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Exemple de réponse</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2024-04-26T12:00:00Z"
    }
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Documentation complète</h4>
                  <p className="text-gray-700 text-sm mb-4">
                    Pour une documentation détaillée de tous les endpoints, paramètres et exemples de code, consultez notre documentation API complète.
                  </p>
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => window.location.href = "/api-docs"}
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Voir la documentation API
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

// Example code snippets
const javascriptExample = `// Initialiser LuvviX ID
import { LuvviXID } from 'luvvix-id';

// Configuration
const luvvixID = new LuvviXID({
  appName: 'your-app-name', // 'main', 'pharmacy', 'streaming', ou 'chat'
  redirectUrl: 'https://votre-app.com/callback'
});

// Rediriger vers la page de connexion
function login() {
  luvvixID.redirectToLogin();
}

// Gérer le callback après authentification
async function handleCallback() {
  try {
    // Récupère et vérifie le token depuis l'URL
    const authResult = await luvvixID.handleCallback();
    
    if (authResult.success) {
      console.log('Utilisateur connecté:', authResult.user);
      // Stocker le token
      localStorage.setItem('luvvix_token', authResult.token);
      // Rediriger vers votre application
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Erreur d\\'authentification:', error);
  }
}

// Vérifier si l'utilisateur est authentifié
function checkAuth() {
  return luvvixID.isAuthenticated();
}

// Obtenir les informations de l'utilisateur
async function getUserProfile() {
  try {
    const userProfile = await luvvixID.getUserProfile();
    console.log('Profil utilisateur:', userProfile);
    return userProfile;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}

// Déconnexion
function logout() {
  luvvixID.logout();
  window.location.href = '/login';
}
`;

const reactExample = `// Exemple d'intégration avec React
import { useState, useEffect } from 'react';
import { LuvviXID } from 'luvvix-id';

// Créer un hook personnalisé pour LuvviX ID
function useLuvviXID() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialiser le SDK
  const luvvixID = new LuvviXID({
    appName: 'your-app-name', // 'main', 'pharmacy', 'streaming', ou 'chat'
    redirectUrl: window.location.origin + '/callback'
  });

  useEffect(() => {
    // Vérifier l'authentification au chargement
    const checkAuthentication = async () => {
      try {
        if (luvvixID.isAuthenticated()) {
          const profile = await luvvixID.getUserProfile();
          setUser(profile);
        }
      } catch (err) {
        setError(err);
        // Token invalide, déconnexion
        luvvixID.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Fonction de connexion
  const login = () => {
    luvvixID.redirectToLogin();
  };

  // Gérer le callback
  const handleCallback = async () => {
    setLoading(true);
    try {
      const authResult = await luvviXID.handleCallback();
      if (authResult.success) {
        setUser(authResult.user);
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    luvvixID.logout();
    setUser(null);
  };

  return { user, loading, error, login, logout, handleCallback };
}

// Exemple de composant d'authentification
function AuthComponent() {
  const { user, loading, login, logout } = useLuvviXID();

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      {user ? (
        <div>
          <h2>Bonjour, {user.full_name || user.email}</h2>
          <button onClick={logout}>Déconnexion</button>
        </div>
      ) : (
        <button onClick={login}>Connexion avec LuvviX ID</button>
      )}
    </div>
  );
}

// Composant pour gérer le callback
function CallbackHandler() {
  const { handleCallback } = useLuvviXID();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    const processCallback = async () => {
      const success = await handleCallback();
      if (success) {
        window.location.href = '/dashboard';
      } else {
        setError(true);
        setProcessing(false);
      }
    };
    
    processCallback();
  }, [handleCallback]);

  if (processing) return <div>Traitement de l'authentification...</div>;
  if (error) return <div>Erreur d'authentification. <a href="/login">Réessayer</a></div>;
  
  return null;
}
`;

const vueExample = `<!-- Vue.js 3 Composition API -->
<script setup>
import { ref, onMounted } from 'vue';
import { LuvviXID } from 'luvvix-id';

const user = ref(null);
const loading = ref(true);
const error = ref(null);

// Initialiser le client LuvviX ID
const luvvixID = new LuvviXID({
  appName: 'your-app-name', // 'main', 'pharmacy', 'streaming', ou 'chat'
  redirectUrl: window.location.origin + '/callback'
});

// Vérifier l'authentification au chargement
onMounted(async () => {
  try {
    if (luvvixID.isAuthenticated()) {
      const profile = await luvvixID.getUserProfile();
      user.value = profile;
    }
  } catch (err) {
    error.value = err;
    // Token invalide, déconnexion
    luvvixID.logout();
  } finally {
    loading.value = false;
  }
});

// Fonction de connexion
function login() {
  luvvixID.redirectToLogin();
}

// Gérer le callback
async function handleCallback() {
  loading.value = true;
  try {
    const authResult = await luvvixID.handleCallback();
    if (authResult.success) {
      user.value = authResult.user;
      return true;
    }
    return false;
  } catch (err) {
    error.value = err;
    return false;
  } finally {
    loading.value = false;
  }
}

// Fonction de déconnexion
function logout() {
  luvvixID.logout();
  user.value = null;
}
</script>

<template>
  <div>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="user">
      <h2>Bonjour, {{ user.full_name || user.email }}</h2>
      <button @click="logout">Déconnexion</button>
    </div>
    <div v-else>
      <button @click="login">Connexion avec LuvviX ID</button>
    </div>
  </div>
</template>
`;

export default DeveloperSection;
