
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, ExternalLink, Key, Shield, Zap, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DeveloperSection = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast.success(`${label} copié dans le presse-papiers`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiKeys = [
    'luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6',
    'luvvix_api_sk_live_61A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7',
    'luvvix_api_sk_live_71B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8',
    'luvvix_api_sk_live_81C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9',
    'luvvix_api_sk_live_91D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0'
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" id="developers">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">API LuvviX ID</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Intégrez l'authentification LuvviX ID dans vos applications avec notre API REST simple et sécurisée
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="authentication">Authentification</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Exemples</TabsTrigger>
            <TabsTrigger value="keys">Clés API</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Authentification Sécurisée</CardTitle>
                  <CardDescription>
                    Système d'authentification robuste avec tokens JWT et OAuth 2.0
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>API REST Simple</CardTitle>
                  <CardDescription>
                    Endpoints HTTPS simples, documentation complète et réponses JSON
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Key className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>Clés API Prêtes</CardTitle>
                  <CardDescription>
                    10 clés API prédéfinies pour démarrer immédiatement vos intégrations
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Base URL de l'API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                  https://luvvix.it.com/auth
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentification Utilisateur</CardTitle>
                <CardDescription>
                  Authentifiez un utilisateur avec email/mot de passe et récupérez un token d'accès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Endpoint</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <code>POST https://luvvix.it.com/auth/authenticate</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Headers requis</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <code>Content-Type: application/json</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Body de la requête</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">{`{
  "email": "user@example.com",
  "password": "userpassword",
  "service_key": "luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6"
}`}</pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`{
  "email": "user@example.com",
  "password": "userpassword",
  "service_key": "luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6"
}`, "Exemple de requête")}
                    >
                      {copiedCode === "Exemple de requête" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Réponse de succès (200)</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <pre className="text-sm overflow-x-auto">{`{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "expires_at": 1640995200,
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "full_name": "John Doe",
      "username": "johndoe",
      "avatar_url": "https://..."
    }
  }
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            {[
              {
                method: "POST",
                endpoint: "/authenticate",
                description: "Authentifie un utilisateur et retourne un token d'accès",
                parameters: ["email", "password", "service_key"]
              },
              {
                method: "POST",
                endpoint: "/verify-token",
                description: "Vérifie la validité d'un token d'accès",
                parameters: ["token"]
              },
              {
                method: "POST",
                endpoint: "/get-user-info",
                description: "Récupère les informations détaillées d'un utilisateur",
                parameters: ["token"]
              },
              {
                method: "GET",
                endpoint: "/get-api-keys",
                description: "Récupère la liste des clés API disponibles",
                parameters: []
              },
              {
                method: "POST",
                endpoint: "/register-service",
                description: "Enregistre un nouveau service pour OAuth",
                parameters: ["service_name", "service_url", "service_key", "redirect_uris"]
              }
            ].map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant={endpoint.method === "GET" ? "secondary" : "default"}>
                      {endpoint.method}
                    </Badge>
                    <CardTitle className="text-lg">{endpoint.endpoint}</CardTitle>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-2">Paramètres requis</h4>
                    {endpoint.parameters.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {endpoint.parameters.map((param) => (
                          <Badge key={param} variant="outline">{param}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucun paramètre requis</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exemple JavaScript/Node.js</CardTitle>
                <CardDescription>
                  Implémentation complète avec fetch API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">{`// Authentification utilisateur
const authenticateUser = async (email, password) => {
  try {
    const response = await fetch('https://luvvix.it.com/auth/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        service_key: 'luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const { access_token, user } = data.data;
      console.log('Utilisateur connecté:', user);
      
      // Vérifier le token
      const verifyResponse = await fetch('https://luvvix.it.com/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: access_token
        })
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Token valide:', verifyData.data.valid);
      
      return { token: access_token, user };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Erreur d\\'authentification:', error);
    throw error;
  }
};

// Utilisation
authenticateUser('user@example.com', 'password123')
  .then(({ token, user }) => {
    console.log('Connexion réussie pour:', user.email);
  })
  .catch(error => {
    console.error('Échec de la connexion:', error);
  });`}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`// Authentification utilisateur
const authenticateUser = async (email, password) => {
  try {
    const response = await fetch('https://luvvix.it.com/auth/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        service_key: 'luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const { access_token, user } = data.data;
      console.log('Utilisateur connecté:', user);
      
      // Vérifier le token
      const verifyResponse = await fetch('https://luvvix.it.com/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: access_token
        })
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Token valide:', verifyData.data.valid);
      
      return { token: access_token, user };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Erreur d\\'authentification:', error);
    throw error;
  }
};`, "Code JavaScript")}
                  >
                    {copiedCode === "Code JavaScript" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exemple Python</CardTitle>
                <CardDescription>
                  Utilisation avec la bibliothèque requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">{`import requests
import json

class LuvvixAuth:
    def __init__(self, service_key):
        self.base_url = "https://luvvix.it.com/auth"
        self.service_key = service_key
    
    def authenticate(self, email, password):
        """Authentifie un utilisateur et retourne les données de session"""
        url = f"{self.base_url}/authenticate"
        payload = {
            "email": email,
            "password": password,
            "service_key": self.service_key
        }
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data.get("success"):
            return data["data"]
        else:
            raise Exception(f"Authentification échouée: {data.get('error')}")
    
    def verify_token(self, token):
        """Vérifie la validité d'un token"""
        url = f"{self.base_url}/verify-token"
        payload = {"token": token}
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        return data.get("data", {}).get("valid", False)

# Utilisation
auth = LuvvixAuth("luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6")

try:
    user_data = auth.authenticate("user@example.com", "password123")
    print(f"Utilisateur connecté: {user_data['user']['email']}")
    
    is_valid = auth.verify_token(user_data["access_token"])
    print(f"Token valide: {is_valid}")
    
except Exception as e:
    print(f"Erreur: {e}")`}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`import requests
import json

class LuvvixAuth:
    def __init__(self, service_key):
        self.base_url = "https://luvvix.it.com/auth"
        self.service_key = service_key
    
    def authenticate(self, email, password):
        """Authentifie un utilisateur et retourne les données de session"""
        url = f"{self.base_url}/authenticate"
        payload = {
            "email": email,
            "password": password,
            "service_key": self.service_key
        }
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data.get("success"):
            return data["data"]
        else:
            raise Exception(f"Authentification échouée: {data.get('error')}")
    
    def verify_token(self, token):
        """Vérifie la validité d'un token"""
        url = f"{self.base_url}/verify-token"
        payload = {"token": token}
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        return data.get("data", {}).get("valid", False)`, "Code Python")}
                  >
                    {copiedCode === "Code Python" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clés API Disponibles</CardTitle>
                <CardDescription>
                  Utilisez une de ces clés comme paramètre 'service_key' dans vos requêtes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiKeys.map((key, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <code className="text-sm font-mono">{key}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(key, `Clé API ${index + 1}`)}
                      >
                        {copiedCode === `Clé API ${index + 1}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Note importante
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Ces clés API sont prédéfinies et prêtes à l'emploi pour vos tests et intégrations. 
                    Choisissez n'importe laquelle de ces clés pour authentifier vos requêtes vers l'API LuvviX ID.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test rapide</CardTitle>
                <CardDescription>
                  Testez l'API directement depuis votre navigateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm">{`curl -X POST https://luvvix.it.com/auth/get-api-keys \\
  -H "Content-Type: application/json"`}</pre>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Cette commande retourne la liste complète des clés API disponibles
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Link to="/api-docs">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Code className="w-5 h-5 mr-2" />
              Documentation complète
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;
