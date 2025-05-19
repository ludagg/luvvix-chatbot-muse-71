
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck } from "lucide-react";

const ApiDocs = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate a sample code snippet for React
  const reactSnippet = `// Installation
npm install luvvix-id-sdk

// Configuration
import { LuvviXID } from 'luvvix-id-sdk';

// Initialize the client
const luvvixAuth = new LuvviXID({
  appName: 'your-app-name', // Must match the registered app name
  redirectUrl: 'https://your-app.com/auth/callback',
});

// Check if user is already authenticated
const isLoggedIn = luvvixAuth.isAuthenticated();

// Redirect to LuvviX ID login
function handleLogin() {
  luvvixAuth.redirectToLogin();
}

// Handle the callback after authentication
async function handleCallback() {
  try {
    const result = await luvvixAuth.handleCallback();
    console.log('Authenticated user:', result.user);
    // Redirect to your app dashboard
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

// Logout
function handleLogout() {
  luvvixAuth.logout();
}`;

  // Generate a sample redirect URL
  const redirectExample = `https://luvvix-id.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://your-app.com/auth/callback&state=random-state-value&scope=profile email`;

  // Generate SDK installation
  const installationCode = `npm install luvvix-id-sdk
# or
yarn add luvvix-id-sdk
# or
pnpm add luvvix-id-sdk`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold">LuvviX ID Documentation</h1>
            <p className="text-gray-600 mt-4">
              Guide d'intégration du système d'authentification centralisé LuvviX ID
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="integration">Intégration</TabsTrigger>
              <TabsTrigger value="api-reference">API Reference</TabsTrigger>
              <TabsTrigger value="sdk">SDK</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du système LuvviX ID</CardTitle>
                  <CardDescription>
                    Comprendre le système d'authentification centralisé LuvviX ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Qu'est-ce que LuvviX ID?</h3>
                      <p className="text-gray-600">
                        LuvviX ID est un système d'authentification centralisé (SSO) qui permet aux utilisateurs 
                        d'accéder à l'ensemble de l'écosystème LuvviX avec un seul compte. C'est similaire 
                        à l'authentification Google, permettant aux utilisateurs de se connecter une seule fois 
                        pour accéder à de multiples applications.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Caractéristiques principales</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>Authentification unique (SSO) pour tout l'écosystème LuvviX</li>
                        <li>Support multi-comptes sur un même appareil</li>
                        <li>Gestion centralisée des comptes utilisateur</li>
                        <li>Déconnexion globale ou par application</li>
                        <li>Redirection sécurisée avec jetons JWT</li>
                        <li>Interface simple et intuitive</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Comment ça fonctionne</h3>
                      <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                          <div>
                            <h4 className="font-medium">Redirection</h4>
                            <p className="text-sm text-gray-600">
                              L'utilisateur est redirigé depuis votre application vers LuvviX ID avec des paramètres d'authentification.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                          <div>
                            <h4 className="font-medium">Connexion</h4>
                            <p className="text-sm text-gray-600">
                              L'utilisateur se connecte avec ses identifiants LuvviX ID ou crée un nouveau compte.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                          <div>
                            <h4 className="font-medium">Autorisation</h4>
                            <p className="text-sm text-gray-600">
                              L'utilisateur autorise votre application à accéder à son compte LuvviX ID.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">4</div>
                          <div>
                            <h4 className="font-medium">Redirection retour</h4>
                            <p className="text-sm text-gray-600">
                              L'utilisateur est redirigé vers votre application avec un token d'authentification.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Avantages pour les développeurs</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>Intégration facile avec le SDK LuvviX ID</li>
                        <li>Sécurité renforcée pour l'authentification</li>
                        <li>Documentation complète et exemples de code</li>
                        <li>Pas besoin de gérer les comptes utilisateurs</li>
                        <li>Support pour différentes plateformes et frameworks</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integration">
              <Card>
                <CardHeader>
                  <CardTitle>Guide d'intégration</CardTitle>
                  <CardDescription>
                    Apprenez à intégrer LuvviX ID dans votre application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Étape 1: Enregistrer votre application</h3>
                      <p className="text-gray-600 mb-3">
                        Pour commencer, vous devez enregistrer votre application auprès de LuvviX ID pour obtenir 
                        un client ID et un client secret.
                      </p>
                      <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                        <li>Contactez l'équipe LuvviX pour obtenir un accès au tableau de bord admin</li>
                        <li>Créez une nouvelle application en indiquant:
                          <ul className="list-disc pl-5 mt-1">
                            <li>Nom de l'application</li>
                            <li>Description</li>
                            <li>URLs de redirection autorisées</li>
                          </ul>
                        </li>
                        <li>Notez votre client ID et client secret (à ne jamais partager publiquement)</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Étape 2: Installer le SDK</h3>
                      <p className="text-gray-600 mb-3">
                        Installez le SDK LuvviX ID dans votre application:
                      </p>
                      <div className="relative bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm"><code>{installationCode}</code></pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(installationCode, 'install')}
                        >
                          {copied === 'install' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Étape 3: Configurer le SDK</h3>
                      <p className="text-gray-600 mb-3">
                        Configurez le SDK avec votre client ID et URL de redirection:
                      </p>
                      <div className="relative bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm"><code>{`import { LuvviXID } from 'luvvix-id-sdk';

const luvvixAuth = new LuvviXID({
  appName: 'your-app-name',
  redirectUrl: 'https://your-app.com/auth/callback'
});`}</code></pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(`import { LuvviXID } from 'luvvix-id-sdk';

const luvvixAuth = new LuvviXID({
  appName: 'your-app-name',
  redirectUrl: 'https://your-app.com/auth/callback'
});`, 'config')}
                        >
                          {copied === 'config' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Étape 4: Rediriger vers la page de connexion</h3>
                      <p className="text-gray-600 mb-3">
                        Quand un utilisateur veut se connecter, redirigez-le vers LuvviX ID:
                      </p>
                      <div className="relative bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm"><code>{`// Bouton de connexion
function LoginButton() {
  const handleLogin = () => {
    luvvixAuth.redirectToLogin();
  };

  return (
    <button onClick={handleLogin}>
      Se connecter avec LuvviX ID
    </button>
  );
}`}</code></pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(`// Bouton de connexion
function LoginButton() {
  const handleLogin = () => {
    luvvixAuth.redirectToLogin();
  };

  return (
    <button onClick={handleLogin}>
      Se connecter avec LuvviX ID
    </button>
  );
}`, 'login')}
                        >
                          {copied === 'login' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Étape 5: Gérer le callback d'authentification</h3>
                      <p className="text-gray-600 mb-3">
                        Créez une page pour gérer le retour de LuvviX ID avec le token:
                      </p>
                      <div className="relative bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm"><code>{`// Page de callback (example en React)
function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function handleCallback() {
      try {
        // Traite la redirection et extrait le token
        const result = await luvvixAuth.handleCallback();
        console.log('User authenticated:', result.user);
        
        // Redirige vers le dashboard de votre application
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    handleCallback();
  }, []);
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  
  return null;
}`}</code></pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(`// Page de callback (example en React)
function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function handleCallback() {
      try {
        // Traite la redirection et extrait le token
        const result = await luvvixAuth.handleCallback();
        console.log('User authenticated:', result.user);
        
        // Redirige vers le dashboard de votre application
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    handleCallback();
  }, []);
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  
  return null;
}`, 'callback')}
                        >
                          {copied === 'callback' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Étape 6: Vérifier l'authentification</h3>
                      <p className="text-gray-600 mb-3">
                        Vérifiez si l'utilisateur est connecté et accédez à ses informations:
                      </p>
                      <div className="relative bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm"><code>{`// Vérifier l'authentification
function checkAuth() {
  const isAuthenticated = luvvixAuth.isAuthenticated();
  
  if (isAuthenticated) {
    // Obtenir le profil utilisateur
    luvvixAuth.getUserProfile().then(userProfile => {
      console.log('User profile:', userProfile);
    }).catch(err => {
      console.error('Error fetching profile:', err);
    });
    
    return true;
  }
  
  return false;
}

// Protéger une route
function ProtectedRoute({ children }) {
  const isAuthenticated = checkAuth();
  
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion
    luvvixAuth.redirectToLogin();
    return null;
  }
  
  return children;
}`}</code></pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(`// Vérifier l'authentification
function checkAuth() {
  const isAuthenticated = luvvixAuth.isAuthenticated();
  
  if (isAuthenticated) {
    // Obtenir le profil utilisateur
    luvvixAuth.getUserProfile().then(userProfile => {
      console.log('User profile:', userProfile);
    }).catch(err => {
      console.error('Error fetching profile:', err);
    });
    
    return true;
  }
  
  return false;
}

// Protéger une route
function ProtectedRoute({ children }) {
  const isAuthenticated = checkAuth();
  
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion
    luvvixAuth.redirectToLogin();
    return null;
  }
  
  return children;
}`, 'verify')}
                        >
                          {copied === 'verify' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Étape 7: Gérer la déconnexion</h3>
                      <p className="text-gray-600 mb-3">
                        Implémentez un bouton de déconnexion:
                      </p>
                      <div className="relative bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm"><code>{`function LogoutButton() {
  const handleLogout = () => {
    luvvixAuth.logout();
    // Redirection vers la page d'accueil ou de connexion
    window.location.href = '/';
  };
  
  return (
    <button onClick={handleLogout}>
      Déconnexion
    </button>
  );
}`}</code></pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(`function LogoutButton() {
  const handleLogout = () => {
    luvvixAuth.logout();
    // Redirection vers la page d'accueil ou de connexion
    window.location.href = '/';
  };
  
  return (
    <button onClick={handleLogout}>
      Déconnexion
    </button>
  );
}`, 'logout')}
                        >
                          {copied === 'logout' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <h4 className="font-medium">Note importante</h4>
                      <p className="text-sm text-gray-700">
                        N'oubliez pas d'ajouter l'URL de callback à la liste des URLs de redirection autorisées
                        dans les paramètres de votre application sur le tableau de bord LuvviX ID.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api-reference">
              <Card>
                <CardHeader>
                  <CardTitle>Référence API</CardTitle>
                  <CardDescription>
                    Documentation complète des endpoints de l'API LuvviX ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Paramètres d'authentification</h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2">Paramètre</th>
                            <th className="text-left py-2 px-2">Description</th>
                            <th className="text-left py-2 px-2">Obligatoire</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">client_id</td>
                            <td className="py-2 px-2 text-sm">L'identifiant unique de votre application</td>
                            <td className="py-2 px-2 text-sm">Oui</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">redirect_uri</td>
                            <td className="py-2 px-2 text-sm">L'URL de redirection après authentification</td>
                            <td className="py-2 px-2 text-sm">Oui</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">state</td>
                            <td className="py-2 px-2 text-sm">Valeur aléatoire pour prévenir les attaques CSRF</td>
                            <td className="py-2 px-2 text-sm">Recommandé</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">scope</td>
                            <td className="py-2 px-2 text-sm">Permissions demandées (séparées par des espaces)</td>
                            <td className="py-2 px-2 text-sm">Non (défaut: "profile")</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Endpoints API</h3>
                      
                      {/* Authorization endpoint */}
                      <div className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded mr-2">GET</span>
                            <span className="font-mono text-sm">/oauth/authorize</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          Redirige l'utilisateur vers la page d'authentification LuvviX ID
                        </p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium">Exemple d'URL:</h4>
                          <div className="relative bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            <code className="text-xs">{redirectExample}</code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-1 right-1 text-gray-500"
                              onClick={() => handleCopy(redirectExample, 'redirect')}
                            >
                              {copied === 'redirect' ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Token verification endpoint */}
                      <div className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded mr-2">POST</span>
                            <span className="font-mono text-sm">/api/verify-token</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          Vérifie la validité d'un token d'authentification
                        </p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium">Corps de la requête:</h4>
                          <div className="relative bg-gray-100 p-2 rounded mt-1">
                            <pre className="text-xs"><code>{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}</code></pre>
                          </div>
                          
                          <h4 className="text-sm font-medium mt-3">Réponse:</h4>
                          <div className="relative bg-gray-100 p-2 rounded mt-1">
                            <pre className="text-xs"><code>{`{
  "success": true,
  "data": {
    "valid": true,
    "user_id": "user-uuid",
    "expires_at": "2023-12-31T23:59:59Z"
  }
}`}</code></pre>
                          </div>
                        </div>
                      </div>
                      
                      {/* User info endpoint */}
                      <div className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded mr-2">POST</span>
                            <span className="font-mono text-sm">/api/get-user-info</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          Récupère les informations de l'utilisateur à partir d'un token
                        </p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium">Corps de la requête:</h4>
                          <div className="relative bg-gray-100 p-2 rounded mt-1">
                            <pre className="text-xs"><code>{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}</code></pre>
                          </div>
                          
                          <h4 className="text-sm font-medium mt-3">Réponse:</h4>
                          <div className="relative bg-gray-100 p-2 rounded mt-1">
                            <pre className="text-xs"><code>{`{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "status": "active"
  }
}`}</code></pre>
                          </div>
                        </div>
                      </div>
                      
                      {/* App access authorization endpoint */}
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded mr-2">POST</span>
                            <span className="font-mono text-sm">/api/authorize-app</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          Autorise une application à accéder au compte d'un utilisateur
                        </p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium">Corps de la requête:</h4>
                          <div className="relative bg-gray-100 p-2 rounded mt-1">
                            <pre className="text-xs"><code>{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "app_name": "luvvix-ai"
}`}</code></pre>
                          </div>
                          
                          <h4 className="text-sm font-medium mt-3">Réponse:</h4>
                          <div className="relative bg-gray-100 p-2 rounded mt-1">
                            <pre className="text-xs"><code>{`{
  "success": true,
  "data": {
    "authorized": true,
    "app_name": "luvvix-ai",
    "user_id": "user-uuid"
  }
}`}</code></pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Codes d'erreur</h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2">Erreur</th>
                            <th className="text-left py-2 px-2">Description</th>
                            <th className="text-left py-2 px-2">Code HTTP</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">invalid_request</td>
                            <td className="py-2 px-2 text-sm">Paramètres manquants ou invalides</td>
                            <td className="py-2 px-2 text-sm">400</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">invalid_client</td>
                            <td className="py-2 px-2 text-sm">Client ID inconnu ou non valide</td>
                            <td className="py-2 px-2 text-sm">401</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">unauthorized_redirect_uri</td>
                            <td className="py-2 px-2 text-sm">URI de redirection non autorisée</td>
                            <td className="py-2 px-2 text-sm">400</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">invalid_token</td>
                            <td className="py-2 px-2 text-sm">Token non valide ou expiré</td>
                            <td className="py-2 px-2 text-sm">401</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">server_error</td>
                            <td className="py-2 px-2 text-sm">Erreur interne du serveur</td>
                            <td className="py-2 px-2 text-sm">500</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sdk">
              <Card>
                <CardHeader>
                  <CardTitle>SDK LuvviX ID</CardTitle>
                  <CardDescription>
                    Explorez les fonctionnalités du SDK JavaScript
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Exemple d'intégration complète</h3>
                      <div className="relative bg-gray-900 text-white p-4 rounded-md overflow-x-auto max-h-96">
                        <pre className="text-sm"><code>{reactSnippet}</code></pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(reactSnippet, 'full-example')}
                        >
                          {copied === 'full-example' ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Méthodes disponibles</h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2">Méthode</th>
                            <th className="text-left py-2 px-2">Description</th>
                            <th className="text-left py-2 px-2">Arguments</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">redirectToLogin</td>
                            <td className="py-2 px-2 text-sm">Redirige vers la page de connexion</td>
                            <td className="py-2 px-2 text-sm">options?: {"{signup: boolean}"}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">handleCallback</td>
                            <td className="py-2 px-2 text-sm">Traite la redirection de retour et extrait le token</td>
                            <td className="py-2 px-2 text-sm">-</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">isAuthenticated</td>
                            <td className="py-2 px-2 text-sm">Vérifie si l'utilisateur est connecté</td>
                            <td className="py-2 px-2 text-sm">-</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">getUserProfile</td>
                            <td className="py-2 px-2 text-sm">Récupère les informations du profil utilisateur</td>
                            <td className="py-2 px-2 text-sm">-</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">logout</td>
                            <td className="py-2 px-2 text-sm">Déconnecte l'utilisateur</td>
                            <td className="py-2 px-2 text-sm">options?: {"{redirect?: string}"}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-2 font-mono text-sm">getToken</td>
                            <td className="py-2 px-2 text-sm">Récupère le token d'authentification</td>
                            <td className="py-2 px-2 text-sm">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDocs;
