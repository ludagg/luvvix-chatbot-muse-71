
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, ExternalLink, Key, Shield, Zap, Copy, Check, Bot, Languages, Mail, Cloud, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";

const DeveloperPage = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast.success(`${label} copié dans le presse-papiers`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiServices = [
    {
      name: "LuvviX ID Auth",
      description: "Service d'authentification unifié",
      endpoint: "https://luvvix.it.com/auth",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
      features: ["SSO", "JWT Tokens", "OAuth 2.0", "Multi-Factor Auth"]
    },
    {
      name: "LuvviX AI API",
      description: "Intelligence artificielle Gemini 1.5 Flash",
      endpoint: "https://api.luvvix.it.com/ai",
      icon: Bot,
      color: "from-purple-500 to-pink-500",
      features: ["Chat Completion", "Text Generation", "Translation", "Summarization"]
    },
    {
      name: "LuvviX Translate API",
      description: "Traduction multilingue intelligente",
      endpoint: "https://api.luvvix.it.com/translate",
      icon: Languages,
      color: "from-emerald-500 to-teal-500",
      features: ["130+ Languages", "Context Aware", "Batch Processing", "Auto Detection"]
    },
    {
      name: "LuvviX Cloud API",
      description: "Gestionnaire de stockage unifié",
      endpoint: "https://api.luvvix.it.com/cloud",
      icon: Cloud,
      color: "from-cyan-500 to-blue-500",
      features: ["Multi-Cloud Sync", "File Management", "Secure Storage", "Real-time Sync"]
    },
    {
      name: "LuvviX Mail API",
      description: "Service de messagerie intelligente",
      endpoint: "https://api.luvvix.it.com/mail",
      icon: Mail,
      color: "from-orange-500 to-red-500",
      features: ["Email Management", "AI Responses", "Auto Translation", "Smart Filtering"]
    }
  ];

  const apiKeys = [
    'luvvix_api_sk_live_51H1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6',
    'luvvix_api_sk_live_61A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7',
    'luvvix_api_sk_live_71B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8',
    'luvvix_api_sk_live_81C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9',
    'luvvix_api_sk_live_91D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0',
    'luvvix_api_sk_live_A1E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0',
    'luvvix_api_sk_live_B2F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1',
    'luvvix_api_sk_live_C3G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2',
    'luvvix_api_sk_live_D4H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3',
    'luvvix_api_sk_live_E5I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            <Code className="w-4 h-4 mr-2" />
            API LuvviX pour Développeurs
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Construisez avec LuvviX
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Intégrez l'écosystème LuvviX dans vos applications avec nos APIs puissantes et notre SDK JavaScript
          </p>
        </div>

        {/* Services Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {apiServices.map((service, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      {service.endpoint}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {service.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="quickstart" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quickstart">Démarrage Rapide</TabsTrigger>
            <TabsTrigger value="authentication">Authentification</TabsTrigger>
            <TabsTrigger value="ai">IA & Traduction</TabsTrigger>
            <TabsTrigger value="examples">Exemples</TabsTrigger>
            <TabsTrigger value="keys">Clés API</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-500" />
                  Installation du SDK LuvviX
                </CardTitle>
                <CardDescription>
                  Commencez à utiliser LuvviX en quelques minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">NPM</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                    <code>npm install @luvvix/sdk</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-gray-700"
                      onClick={() => copyToClipboard('npm install @luvvix/sdk', 'Commande NPM')}
                    >
                      {copiedCode === "Commande NPM" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">CDN</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                    <code>{`<script src="https://cdn.luvvix.it.com/sdk/v1/luvvix.min.js"></script>`}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-gray-700"
                      onClick={() => copyToClipboard('<script src="https://cdn.luvvix.it.com/sdk/v1/luvvix.min.js"></script>', 'Script CDN')}
                    >
                      {copiedCode === "Script CDN" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Initialisation</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                    <pre>{`import LuvviX from '@luvvix/sdk';

const luvvix = new LuvviX({
  apiKey: 'luvvix_api_sk_live_...',
  environment: 'production' // ou 'development'
});

// Authentification
const auth = await luvvix.auth.login('user@example.com', 'password');

// IA
const response = await luvvix.ai.chat('Bonjour, comment ça va ?');

// Traduction
const translated = await luvvix.translate('Hello', { to: 'fr' });`}</pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-gray-700"
                      onClick={() => copyToClipboard(`import LuvviX from '@luvvix/sdk';

const luvvix = new LuvviX({
  apiKey: 'luvvix_api_sk_live_...',
  environment: 'production'
});`, 'Code d\'initialisation')}
                    >
                      {copiedCode === "Code d'initialisation" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentification LuvviX ID</CardTitle>
                <CardDescription>
                  Système d'authentification unifié pour vos applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Connexion Simple</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                    <pre>{`// Connexion utilisateur
const result = await luvvix.auth.login('user@example.com', 'password');

if (result.success) {
  console.log('Utilisateur connecté:', result.user);
  localStorage.setItem('luvvix_token', result.token);
} else {
  console.error('Erreur:', result.error);
}

// Vérification du token
const isValid = await luvvix.auth.verifyToken(token);

// Déconnexion
await luvvix.auth.logout();`}</pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-gray-700"
                      onClick={() => copyToClipboard(`const result = await luvvix.auth.login('user@example.com', 'password');`, 'Code authentification')}
                    >
                      {copiedCode === "Code authentification" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">OAuth 2.0</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                    <pre>{`// Redirection OAuth
const authUrl = luvvix.auth.getOAuthUrl({
  clientId: 'your_client_id',
  redirectUri: 'https://yourapp.com/callback',
  scope: ['read', 'write']
});

window.location.href = authUrl;

// Callback handling
const tokens = await luvvix.auth.handleOAuthCallback(code, state);`}</pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-gray-700"
                      onClick={() => copyToClipboard(`const authUrl = luvvix.auth.getOAuthUrl({
  clientId: 'your_client_id',
  redirectUri: 'https://yourapp.com/callback'
});`, 'Code OAuth')}
                    >
                      {copiedCode === "Code OAuth" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-purple-500" />
                    LuvviX AI (Gemini 1.5 Flash)
                  </CardTitle>
                  <CardDescription>
                    Intelligence artificielle conversationnelle avancée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                    <pre>{`// Chat simple
const response = await luvvix.ai.chat('Écris un email professionnel');

// Chat avec contexte
const conversation = await luvvix.ai.createConversation();
await conversation.addMessage('user', 'Bonjour');
const reply = await conversation.getResponse();

// Génération de contenu
const content = await luvvix.ai.generate({
  prompt: 'Écris un article sur l\'IA',
  maxTokens: 500,
  temperature: 0.7
});

// Résumé de texte
const summary = await luvvix.ai.summarize(longText, {
  maxLength: 100
});`}</pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-gray-700"
                      onClick={() => copyToClipboard(`const response = await luvvix.ai.chat('Écris un email professionnel');`, 'Code IA')}
                    >
                      {copiedCode === "Code IA" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="w-5 h-5 mr-2 text-emerald-500" />
                    LuvviX Translate
                  </CardTitle>
                  <CardDescription>
                    Traduction intelligente multilingue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                    <pre>{`// Traduction simple
const result = await luvvix.translate('Hello world', {
  to: 'fr'
});
// Résultat: "Bonjour le monde"

// Détection automatique
const detected = await luvvix.translate('Hola mundo', {
  to: 'en',
  autoDetect: true
});

// Traduction en lot
const batch = await luvvix.translate.batch([
  'Hello',
  'How are you?',
  'Goodbye'
], { to: 'es' });

// Langues supportées
const languages = await luvvix.translate.getSupportedLanguages();`}</pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-gray-700"
                      onClick={() => copyToClipboard(`const result = await luvvix.translate('Hello world', { to: 'fr' });`, 'Code traduction')}
                    >
                      {copiedCode === "Code traduction" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Complète React</CardTitle>
                <CardDescription>
                  Exemple d'intégration complète avec authentification et IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative overflow-x-auto">
                  <pre>{`import React, { useState, useEffect } from 'react';
import LuvviX from '@luvvix/sdk';

const App = () => {
  const [luvvix] = useState(new LuvviX({
    apiKey: 'luvvix_api_sk_live_...'
  }));
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('luvvix_token');
    if (token) {
      luvvix.auth.verifyToken(token).then(valid => {
        if (valid) {
          luvvix.auth.getCurrentUser().then(setUser);
        }
      });
    }
  }, []);

  const handleLogin = async (email, password) => {
    const result = await luvvix.auth.login(email, password);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('luvvix_token', result.token);
    }
  };

  const handleAIChat = async () => {
    if (!message.trim()) return;
    
    const aiResponse = await luvvix.ai.chat(message);
    setResponse(aiResponse.content);
    setMessage('');
  };

  const handleTranslate = async (text, lang) => {
    const translated = await luvvix.translate(text, { to: lang });
    return translated.text;
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <h1>Bienvenue, {user.name}!</h1>
      
      <div className="ai-chat">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Posez une question à l'IA..."
          onKeyPress={e => e.key === 'Enter' && handleAIChat()}
        />
        <button onClick={handleAIChat}>Envoyer</button>
        {response && <div className="response">{response}</div>}
      </div>
      
      <button onClick={() => luvvix.auth.logout().then(() => setUser(null))}>
        Déconnexion
      </button>
    </div>
  );
};

export default App;`}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:bg-gray-700"
                    onClick={() => copyToClipboard(`import React, { useState, useEffect } from 'react';
import LuvviX from '@luvvix/sdk';

const App = () => {
  const [luvvix] = useState(new LuvviX({
    apiKey: 'luvvix_api_sk_live_...'
  }));
  // ... reste du code
};`, 'Exemple React complet')}
                  >
                    {copiedCode === "Exemple React complet" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intégration Express.js Backend</CardTitle>
                <CardDescription>
                  Utilisation côté serveur pour l'authentification et l'IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                  <pre>{`const express = require('express');
const LuvviX = require('@luvvix/sdk');

const app = express();
const luvvix = new LuvviX({
  apiKey: process.env.LUVVIX_API_KEY
});

app.use(express.json());

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }
  
  const isValid = await luvvix.auth.verifyToken(token);
  if (!isValid) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  
  req.user = await luvvix.auth.getUserFromToken(token);
  next();
};

// Routes protégées
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const response = await luvvix.ai.chat(message);
    res.json({ response: response.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/translate', authenticateToken, async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const result = await luvvix.translate(text, { to: targetLang });
    res.json({ translation: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});`}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:bg-gray-700"
                    onClick={() => copyToClipboard(`const express = require('express');
const LuvviX = require('@luvvix/sdk');

const app = express();
const luvvix = new LuvviX({
  apiKey: process.env.LUVVIX_API_KEY
});`, 'Exemple Express.js')}
                  >
                    {copiedCode === "Exemple Express.js" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2 text-yellow-500" />
                  Clés API Disponibles
                </CardTitle>
                <CardDescription>
                  Utilisez une de ces clés comme paramètre 'apiKey' dans vos applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiKeys.map((key, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <code className="text-sm font-mono text-gray-700 dark:text-gray-300">{key}</code>
                      </div>
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
                
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Utilisation recommandée
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                    Ces clés API sont prêtes à l'emploi et permettent d'accéder à tous les services LuvviX. 
                    Choisissez n'importe laquelle pour vos tests et développements.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">Exemple d'utilisation:</p>
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                      const luvvix = new LuvviX({'{'}apiKey: '{apiKeys[0]}'{'}});
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limites et Quotas</CardTitle>
                <CardDescription>
                  Informations sur les limites d'utilisation des APIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Plan Gratuit</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• 1,000 requêtes API/mois</li>
                      <li>• 10,000 tokens IA/mois</li>
                      <li>• 500 traductions/mois</li>
                      <li>• Support communautaire</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Plan Pro</h4>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• 100,000 requêtes API/mois</li>
                      <li>• 1M tokens IA/mois</li>
                      <li>• Traductions illimitées</li>
                      <li>• Support prioritaire 24/7</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Rejoignez des milliers de développeurs qui utilisent déjà les APIs LuvviX pour créer des applications innovantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Documentation complète
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Globe className="w-5 h-5 mr-2" />
                  Exemples GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
