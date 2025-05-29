
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Code, Key, Globe, Shield, Zap, Database, Bot, Cloud, MessageCircle, CheckCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EcosystemApiPage = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copié!",
      description: "Le contenu a été copié dans le presse-papiers"
    });
  };

  const apis = [
    {
      id: 'auth',
      name: 'LuvviX ID',
      description: 'Système d\'authentification centralisé SSO',
      icon: <Shield className="h-6 w-6" />,
      status: 'Stable',
      version: 'v2.1',
      baseUrl: 'https://auth.luvvix.com/api',
      endpoints: [
        { method: 'POST', path: '/verify-token', description: 'Vérifier un token d\'authentification' },
        { method: 'POST', path: '/get-user-info', description: 'Obtenir les informations utilisateur' },
        { method: 'POST', path: '/authorize-app', description: 'Autoriser l\'accès à une application' }
      ]
    },
    {
      id: 'ai',
      name: 'LuvviX AI Studio',
      description: 'Intelligence artificielle et génération de contenu',
      icon: <Bot className="h-6 w-6" />,
      status: 'Beta',
      version: 'v1.5',
      baseUrl: 'https://ai.luvvix.com/api',
      endpoints: [
        { method: 'POST', path: '/chat', description: 'Conversation avec un agent IA' },
        { method: 'GET', path: '/agents', description: 'Liste des agents IA disponibles' },
        { method: 'POST', path: '/generate-code', description: 'Génération de code' },
        { method: 'POST', path: '/analyze-code', description: 'Analyse de code' }
      ]
    },
    {
      id: 'cloud',
      name: 'LuvviX Cloud',
      description: 'Stockage et partage de fichiers décentralisé',
      icon: <Cloud className="h-6 w-6" />,
      status: 'Stable',
      version: 'v3.0',
      baseUrl: 'https://cloud.luvvix.com/api',
      endpoints: [
        { method: 'POST', path: '/upload', description: 'Upload de fichier' },
        { method: 'GET', path: '/files', description: 'Liste des fichiers' },
        { method: 'DELETE', path: '/files/:id', description: 'Supprimer un fichier' },
        { method: 'POST', path: '/share', description: 'Créer un lien de partage' }
      ]
    },
    {
      id: 'center',
      name: 'LuvviX Center',
      description: 'Réseau social et messagerie',
      icon: <MessageCircle className="h-6 w-6" />,
      status: 'Stable',
      version: 'v2.3',
      baseUrl: 'https://center.luvvix.com/api',
      endpoints: [
        { method: 'GET', path: '/posts', description: 'Récupérer les posts' },
        { method: 'POST', path: '/posts', description: 'Créer un post' },
        { method: 'GET', path: '/messages', description: 'Récupérer les messages' },
        { method: 'POST', path: '/messages', description: 'Envoyer un message' }
      ]
    },
    {
      id: 'forms',
      name: 'LuvviX Forms',
      description: 'Création et gestion de formulaires',
      icon: <Database className="h-6 w-6" />,
      status: 'Stable',
      version: 'v1.8',
      baseUrl: 'https://forms.luvvix.com/api',
      endpoints: [
        { method: 'GET', path: '/forms', description: 'Liste des formulaires' },
        { method: 'POST', path: '/forms', description: 'Créer un formulaire' },
        { method: 'POST', path: '/submit', description: 'Soumettre une réponse' },
        { method: 'GET', path: '/responses', description: 'Récupérer les réponses' }
      ]
    },
    {
      id: 'translate',
      name: 'LuvviX Translate',
      description: 'Service de traduction multi-langues',
      icon: <Globe className="h-6 w-6" />,
      status: 'Beta',
      version: 'v0.9',
      baseUrl: 'https://translate.luvvix.com/api',
      endpoints: [
        { method: 'POST', path: '/translate', description: 'Traduire un texte' },
        { method: 'GET', path: '/languages', description: 'Langues supportées' },
        { method: 'POST', path: '/detect', description: 'Détecter la langue' }
      ]
    }
  ];

  const generateApiKey = () => {
    const key = 'luvvix_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(key);
    toast({
      title: "Clé API générée",
      description: "Votre nouvelle clé API a été générée avec succès"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Stable': return 'bg-green-100 text-green-800';
      case 'Beta': return 'bg-yellow-100 text-yellow-800';
      case 'Alpha': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                API LuvviX Ecosystem
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              APIs puissantes et sécurisées pour intégrer l'écosystème LuvviX dans vos applications
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="apis">APIs</TabsTrigger>
              <TabsTrigger value="integration">Intégration</TabsTrigger>
              <TabsTrigger value="playground">Playground</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6" />
                    Écosystème API LuvviX
                  </CardTitle>
                  <CardDescription>
                    Découvrez les APIs qui alimentent l'écosystème LuvviX
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apis.map((api) => (
                      <Card key={api.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {api.icon}
                              <h3 className="font-semibold">{api.name}</h3>
                            </div>
                            <Badge className={getStatusColor(api.status)}>
                              {api.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{api.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Version {api.version}</span>
                            <span className="text-blue-600 font-mono text-xs">{api.baseUrl}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-6 w-6" />
                    Authentification
                  </CardTitle>
                  <CardDescription>
                    Toutes les APIs LuvviX utilisent l'authentification par clé API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Headers requis:</h4>
                    <div className="relative bg-gray-900 text-white p-3 rounded text-sm font-mono">
                      <pre>{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}</pre>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        onClick={() => handleCopy(`Authorization: Bearer YOUR_API_KEY\nContent-Type: application/json`, 'auth-headers')}
                      >
                        {copied === 'auth-headers' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Votre clé API apparaîtra ici"
                        value={apiKey}
                        readOnly
                        className="flex-1"
                      />
                      <Button onClick={generateApiKey}>
                        Générer une clé
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Générez une clé API de test pour commencer le développement
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apis" className="space-y-6">
              {apis.map((api) => (
                <Card key={api.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {api.icon}
                        <div>
                          <CardTitle>{api.name}</CardTitle>
                          <CardDescription>{api.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(api.status)}>
                          {api.status}
                        </Badge>
                        <Badge variant="outline">{api.version}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Base URL:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{api.baseUrl}</code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Endpoints disponibles:</h4>
                        <div className="space-y-2">
                          {api.endpoints.map((endpoint, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Badge className={getMethodColor(endpoint.method)} variant="secondary">
                                {endpoint.method}
                              </Badge>
                              <code className="font-mono text-sm flex-1">{endpoint.path}</code>
                              <span className="text-sm text-gray-600">{endpoint.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guide d'intégration rapide</CardTitle>
                  <CardDescription>
                    Commencez à utiliser les APIs LuvviX en quelques étapes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Obtenir une clé API</h4>
                        <p className="text-sm text-gray-600 mb-2">Générez votre clé API depuis le tableau de bord développeur</p>
                        <div className="relative bg-gray-900 text-white p-3 rounded text-sm font-mono">
                          <pre>{`curl -X POST https://api.luvvix.com/auth/generate-key \\
  -H "Content-Type: application/json" \\
  -d '{"app_name": "Mon App"}'`}</pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => handleCopy(`curl -X POST https://api.luvvix.com/auth/generate-key \\\n  -H "Content-Type: application/json" \\\n  -d '{"app_name": "Mon App"}'`, 'step1')}
                          >
                            {copied === 'step1' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Installer le SDK</h4>
                        <p className="text-sm text-gray-600 mb-2">Utilisez notre SDK officiel pour une intégration simplifiée</p>
                        <div className="relative bg-gray-900 text-white p-3 rounded text-sm font-mono">
                          <pre>{`npm install @luvvix/sdk
# ou
yarn add @luvvix/sdk`}</pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => handleCopy(`npm install @luvvix/sdk`, 'step2')}
                          >
                            {copied === 'step2' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Initialiser le client</h4>
                        <p className="text-sm text-gray-600 mb-2">Configurez le client avec votre clé API</p>
                        <div className="relative bg-gray-900 text-white p-3 rounded text-sm font-mono">
                          <pre>{`import { LuvvixClient } from '@luvvix/sdk';

const client = new LuvvixClient({
  apiKey: 'your-api-key',
  environment: 'production' // ou 'sandbox'
});`}</pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => handleCopy(`import { LuvvixClient } from '@luvvix/sdk';\n\nconst client = new LuvvixClient({\n  apiKey: 'your-api-key',\n  environment: 'production'\n});`, 'step3')}
                          >
                            {copied === 'step3' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Faire des appels API</h4>
                        <p className="text-sm text-gray-600 mb-2">Commencez à utiliser les services LuvviX</p>
                        <div className="relative bg-gray-900 text-white p-3 rounded text-sm font-mono">
                          <pre>{`// Authentification
const user = await client.auth.verifyToken(token);

// IA
const response = await client.ai.chat({
  message: "Bonjour!",
  agentId: "assistant-general"
});

// Cloud
const file = await client.cloud.upload(fileData);`}</pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => handleCopy(`// Authentification\nconst user = await client.auth.verifyToken(token);\n\n// IA\nconst response = await client.ai.chat({\n  message: "Bonjour!",\n  agentId: "assistant-general"\n});\n\n// Cloud\nconst file = await client.cloud.upload(fileData);`, 'step4')}
                          >
                            {copied === 'step4' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="playground" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6" />
                    API Playground
                  </CardTitle>
                  <CardDescription>
                    Testez les APIs LuvviX directement depuis votre navigateur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Endpoint</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>POST /api/auth/verify-token</option>
                        <option>POST /api/ai/chat</option>
                        <option>GET /api/cloud/files</option>
                        <option>POST /api/center/posts</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Clé API</label>
                      <Input 
                        placeholder="luvvix_xxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Corps de la requête (JSON)</label>
                    <Textarea 
                      placeholder='{\n  "message": "Bonjour!",\n  "agentId": "assistant-general"\n}'
                      className="font-mono text-sm min-h-32"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <Zap className="h-4 w-4 mr-2" />
                      Tester l'API
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copier en cURL
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Réponse</label>
                    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm min-h-32">
                      <span className="text-gray-400">// La réponse de l'API apparaîtra ici...</span>
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

export default EcosystemApiPage;
