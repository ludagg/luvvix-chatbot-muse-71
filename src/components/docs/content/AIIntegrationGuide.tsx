
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const AIIntegrationGuide = () => {
  const [copySuccess, setCopySuccess] = useState('');
  
  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess('Copié!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4">Guide d'intégration LuvviX AI</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comment intégrer votre application LuvviX AI avec le système d'authentification LuvviX ID.
        </p>
      </section>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="implementation">Implémentation</TabsTrigger>
          <TabsTrigger value="validation">Validation des tokens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="p-4 border rounded-md mt-4">
          <h2 className="text-xl font-semibold mb-3">Vue d'ensemble de l'intégration</h2>
          <p className="mb-4">
            L'intégration entre LuvviX AI et LuvviX ID utilise un mécanisme de transfert de jeton (token) 
            qui permet à votre application LuvviX AI de vérifier l'identité des utilisateurs qui se connectent
            via le système d'authentification central LuvviX ID.
          </p>
          
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Flux d'authentification</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>L'utilisateur se connecte à LuvviX ID depuis l'application principale</li>
              <li>L'utilisateur accède à la page d'intégration LuvviX AI</li>
              <li>Le système génère un token d'authentification temporaire</li>
              <li>L'utilisateur est redirigé vers LuvviX AI avec ce token</li>
              <li>Votre serveur LuvviX AI valide le token auprès de l'API LuvviX ID</li>
              <li>Si le token est valide, l'utilisateur est authentifié dans votre application</li>
            </ol>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mt-6">
            <h4 className="text-amber-800 dark:text-amber-300 font-medium">Important</h4>
            <p className="text-amber-700 dark:text-amber-300">
              Cette méthode d'intégration est destinée uniquement aux applications 
              officiellement approuvées au sein de l'écosystème LuvviX.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="implementation" className="p-4 border rounded-md mt-4">
          <h2 className="text-xl font-semibold mb-3">Implémentation côté client</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Configuration du point de redirection</h3>
            <p className="mb-3">
              Votre application LuvviX AI doit disposer d'un endpoint pour recevoir 
              le token d'authentification. Par défaut, nous utilisons:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <code>https://ai.luvvix.it.com/auth/callback</code>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Gérer la redirection</h3>
            <p className="mb-3">
              Voici comment gérer la réception du token dans votre application:
            </p>
            <div className="relative">
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm">
{`// Dans votre route de callback (ex: /auth/callback)
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function processAuth() {
      try {
        // Récupérer le token et l'ID utilisateur depuis l'URL
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');
        const email = searchParams.get('email');
        
        if (!token) {
          throw new Error('Token manquant dans la redirection');
        }
        
        // Valider le token auprès de votre serveur
        const response = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userId, email })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Échec de validation du token');
        }
        
        // Stocker la session dans votre application
        localStorage.setItem('ai_session', JSON.stringify({
          token: result.sessionToken,
          user: result.user
        }));
        
        // Rediriger vers le dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Erreur lors de l'authentification:', error);
        setError(error.message);
      } finally {
        setIsProcessing(false);
      }
    }
    
    processAuth();
  }, [searchParams, navigate]);
  
  if (isProcessing) {
    return <div>Authentification en cours...</div>;
  }
  
  if (error) {
    return <div>Erreur: {error}</div>;
  }
  
  return null;
};

export default AuthCallback;`}
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(`// Dans votre route de callback (ex: /auth/callback)
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function processAuth() {
      try {
        // Récupérer le token et l'ID utilisateur depuis l'URL
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');
        const email = searchParams.get('email');
        
        if (!token) {
          throw new Error('Token manquant dans la redirection');
        }
        
        // Valider le token auprès de votre serveur
        const response = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userId, email })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Échec de validation du token');
        }
        
        // Stocker la session dans votre application
        localStorage.setItem('ai_session', JSON.stringify({
          token: result.sessionToken,
          user: result.user
        }));
        
        // Rediriger vers le dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Erreur lors de l\\'authentification:', error);
        setError(error.message);
      } finally {
        setIsProcessing(false);
      }
    }
    
    processAuth();
  }, [searchParams, navigate]);
  
  if (isProcessing) {
    return <div>Authentification en cours...</div>;
  }
  
  if (error) {
    return <div>Erreur: {error}</div>;
  }
  
  return null;
};

export default AuthCallback;`)}
              >
                {copySuccess === 'Copié!' ? copySuccess : 'Copier'}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="validation" className="p-4 border rounded-md mt-4">
          <h2 className="text-xl font-semibold mb-3">Validation des tokens côté serveur</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">API de validation</h3>
            <p className="mb-3">
              Votre serveur doit implémenter un endpoint pour valider les tokens 
              auprès du service d'authentification LuvviX ID:
            </p>
            
            <div className="relative">
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm">
{`// Exemple avec Node.js et Express
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Définir la clé secrète de votre application (fournie par l'administrateur LuvviX)
const APP_SECRET = 'votre_clé_secrète_luvvix_ai';
const APP_ID = 'luvvix_ai';
const AUTH_API_URL = 'https://api.luvvix.it.com/auth/validate-token';

router.post('/validate-token', async (req, res) => {
  try {
    const { token, userId, email } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token manquant'
      });
    }
    
    // Faire une demande au service d'authentification LuvviX ID
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': APP_ID,
        'X-App-Secret': APP_SECRET
      },
      body: JSON.stringify({ token, userId })
    });
    
    const validationResult = await response.json();
    
    if (!validationResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    // Créer une session pour votre application
    const sessionToken = generateSessionToken(validationResult.user);
    
    // Répondre avec les informations de session
    return res.json({
      success: true,
      sessionToken,
      user: {
        id: validationResult.user.id,
        email: validationResult.user.email,
        name: validationResult.user.name
      }
    });
  } catch (error) {
    console.error('Erreur de validation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du token'
    });
  }
});

// Fonction pour générer un token de session pour votre application
function generateSessionToken(user) {
  // Implémentez votre propre logique de génération de token ici
  // Par exemple avec JWT
  return 'session_token_generated';
}

module.exports = router;`}
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(`// Exemple avec Node.js et Express
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Définir la clé secrète de votre application (fournie par l'administrateur LuvviX)
const APP_SECRET = 'votre_clé_secrète_luvvix_ai';
const APP_ID = 'luvvix_ai';
const AUTH_API_URL = 'https://api.luvvix.it.com/auth/validate-token';

router.post('/validate-token', async (req, res) => {
  try {
    const { token, userId, email } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token manquant'
      });
    }
    
    // Faire une demande au service d'authentification LuvviX ID
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': APP_ID,
        'X-App-Secret': APP_SECRET
      },
      body: JSON.stringify({ token, userId })
    });
    
    const validationResult = await response.json();
    
    if (!validationResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    // Créer une session pour votre application
    const sessionToken = generateSessionToken(validationResult.user);
    
    // Répondre avec les informations de session
    return res.json({
      success: true,
      sessionToken,
      user: {
        id: validationResult.user.id,
        email: validationResult.user.email,
        name: validationResult.user.name
      }
    });
  } catch (error) {
    console.error('Erreur de validation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du token'
    });
  }
});

// Fonction pour générer un token de session pour votre application
function generateSessionToken(user) {
  // Implémentez votre propre logique de génération de token ici
  // Par exemple avec JWT
  return 'session_token_generated';
}

module.exports = router;`)}
              >
                {copySuccess === 'Copié!' ? copySuccess : 'Copier'}
              </Button>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
            <h4 className="text-blue-800 dark:text-blue-300 font-medium">Sécurité</h4>
            <p className="text-blue-700 dark:text-blue-300">
              Les tokens sont à usage unique et expirent après 5 minutes. 
              Assurez-vous que la validation est effectuée rapidement après la redirection.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-semibold mb-3">Besoin d'aide supplémentaire?</h3>
        <p className="mb-4">
          Si vous avez besoin d'assistance technique pour intégrer LuvviX AI avec le système d'authentification LuvviX ID,
          contactez notre équipe développeur.
        </p>
        <Button>Contacter l'équipe technique</Button>
      </div>
    </div>
  );
};

export default AIIntegrationGuide;
