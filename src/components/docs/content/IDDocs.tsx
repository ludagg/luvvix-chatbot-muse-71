
import { useState } from "react";

const IDDocs = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4">LuvviX ID</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Système d'authentification et de gestion d'identité unifié pour tous vos besoins.
        </p>
      </section>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-4 py-3 text-sm font-medium ${
                selectedTab === 'overview'
                  ? 'bg-violet-50 dark:bg-violet-900/20 border-b-2 border-violet-600 dark:border-violet-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setSelectedTab('authentication')}
              className={`px-4 py-3 text-sm font-medium ${
                selectedTab === 'authentication'
                  ? 'bg-violet-50 dark:bg-violet-900/20 border-b-2 border-violet-600 dark:border-violet-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Authentification
            </button>
            <button
              onClick={() => setSelectedTab('oauth')}
              className={`px-4 py-3 text-sm font-medium ${
                selectedTab === 'oauth'
                  ? 'bg-violet-50 dark:bg-violet-900/20 border-b-2 border-violet-600 dark:border-violet-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              OAuth
            </button>
            <button
              onClick={() => setSelectedTab('sso')}
              className={`px-4 py-3 text-sm font-medium ${
                selectedTab === 'sso'
                  ? 'bg-violet-50 dark:bg-violet-900/20 border-b-2 border-violet-600 dark:border-violet-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              SSO
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Vue d'ensemble de LuvviX ID</h2>
              <p>
                LuvviX ID est un système d'authentification et de gestion d'identité complet qui permet 
                aux utilisateurs de se connecter à tous les services LuvviX avec un seul compte. 
                Il offre également des fonctionnalités avancées pour l'intégration avec d'autres applications.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Pour les utilisateurs finaux</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Un seul compte pour tous les services LuvviX</li>
                    <li>Connexion sécurisée avec authentification à deux facteurs</li>
                    <li>Gestion centralisée des informations personnelles</li>
                    <li>Contrôle des applications connectées</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Pour les développeurs</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>API REST complète pour l'intégration</li>
                    <li>Support OAuth 2.0 et OpenID Connect</li>
                    <li>SDK pour différentes plateformes (JavaScript, Mobile)</li>
                    <li>Fonctionnalités de single sign-on (SSO)</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-3">Architecture de LuvviX ID</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm mb-3">
                    LuvviX ID s'appuie sur une architecture moderne et sécurisée :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Backend sécurisé avec JSON Web Tokens (JWT)</li>
                    <li>Support des protocoles standards de l'industrie</li>
                    <li>Infrastructure hautement disponible et évolutive</li>
                    <li>Conformité RGPD et autres réglementations</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'authentication' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>
              <p>
                LuvviX ID prend en charge plusieurs méthodes d'authentification pour répondre à différents besoins.
              </p>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Email et mot de passe</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      Authentification classique avec email et mot de passe.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      <code>{`// Exemple d'authentification avec JavaScript
const { user, error } = await luvvixID.signIn({ 
  email: 'utilisateur@example.com',
  password: 'motdepasse123'
});

if (error) {
  console.error('Erreur de connexion:', error.message);
} else {
  console.log('Utilisateur connecté:', user);
}`}</code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Authentification à deux facteurs (2FA)</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      Ajoutez une couche de sécurité supplémentaire avec l'authentification à deux facteurs.
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm mb-3">
                      <li>L'utilisateur active la 2FA dans ses paramètres de compte</li>
                      <li>Il configure une application d'authentification (Google Authenticator, etc.)</li>
                      <li>Lors de la connexion, un code supplémentaire est requis</li>
                    </ol>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      <code>{`// Vérification du code 2FA
const { session, error } = await luvvixID.verifyOTP({
  email: 'utilisateur@example.com',
  token: '123456' // Code à 6 chiffres de l'application d'authentification
});`}</code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Connexion avec les réseaux sociaux</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      Permettez aux utilisateurs de se connecter avec leurs comptes de réseaux sociaux.
                    </p>
                    <p className="text-sm mb-2">
                      Fournisseurs pris en charge :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Google</li>
                      <li>Facebook</li>
                      <li>Twitter</li>
                      <li>GitHub</li>
                      <li>Apple</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'oauth' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">OAuth 2.0 et OpenID Connect</h2>
              <p>
                LuvviX ID implémente les protocoles OAuth 2.0 et OpenID Connect pour permettre 
                l'authentification et l'autorisation sécurisées entre applications.
              </p>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Flux d'autorisation</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      LuvviX ID prend en charge les flux d'autorisation OAuth 2.0 suivants :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Authorization Code</strong> - Pour les applications serveur</li>
                      <li><strong>Implicit</strong> - Pour les applications clientes (JavaScript)</li>
                      <li><strong>Resource Owner Password Credentials</strong> - Pour les applications de confiance</li>
                      <li><strong>Client Credentials</strong> - Pour les communications serveur-à-serveur</li>
                      <li><strong>Device Code</strong> - Pour les appareils avec capacités d'entrée limitées</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Intégration OAuth</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      Étapes pour intégrer LuvviX ID dans votre application :
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Créez une application dans la console développeur LuvviX ID</li>
                      <li>Configurez les URLs de redirection autorisées</li>
                      <li>Obtenez vos identifiants OAuth (client_id et client_secret)</li>
                      <li>Implémentez le flux OAuth approprié dans votre application</li>
                    </ol>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Exemple d'implémentation</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      Exemple d'implémentation du flux Authorization Code :
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      <code>{`// 1. Rediriger l'utilisateur vers l'URL d'autorisation
const authUrl = 'https://luvvix.it.com/auth/authorize?' + 
  'client_id=YOUR_CLIENT_ID&' +
  'redirect_uri=YOUR_REDIRECT_URI&' +
  'response_type=code&' +
  'scope=openid profile email';
  
window.location.href = authUrl;

// 2. Récupérer le code d'autorisation dans votre URL de redirection
// et l'échanger contre un token d'accès

async function exchangeCode(code) {
  const response = await fetch('https://luvvix.it.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      redirect_uri: 'YOUR_REDIRECT_URI'
    })
  });
  
  return await response.json();
}`}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'sso' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Single Sign-On (SSO)</h2>
              <p>
                LuvviX ID propose des fonctionnalités de Single Sign-On (SSO) qui permettent aux utilisateurs
                de se connecter une seule fois et d'accéder à toutes les applications connectées.
              </p>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Fonctionnement du SSO</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-3">
                      Le SSO de LuvviX ID fonctionne comme suit :
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>L'utilisateur se connecte à la première application</li>
                      <li>LuvviX ID crée une session SSO</li>
                      <li>Lorsque l'utilisateur accède à d'autres applications connectées, il est automatiquement authentifié</li>
                      <li>Une déconnexion globale déconnecte l'utilisateur de toutes les applications</li>
                    </ol>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Types de SSO</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      LuvviX ID prend en charge différents types de SSO :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>SSO entre applications LuvviX</strong> - Intégré par défaut</li>
                      <li><strong>SSO pour applications tierces</strong> - Via OAuth 2.0 / OIDC</li>
                      <li><strong>SSO d'entreprise</strong> - Intégration avec des fournisseurs d'identité externes</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Configuration du SSO</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm mb-3">
                      Pour configurer le SSO pour votre application :
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Enregistrez votre application dans la console LuvviX ID</li>
                      <li>Configurez les domaines autorisés pour le SSO</li>
                      <li>Intégrez le SDK JavaScript LuvviX ID dans votre application</li>
                    </ol>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto mt-3">
                      <code>{`// Vérification de l'état de session SSO
luvvixID.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // L'utilisateur est connecté via SSO
    console.log('Utilisateur connecté via SSO:', session.user);
  } else if (event === 'SIGNED_OUT') {
    // L'utilisateur s'est déconnecté
    console.log('Utilisateur déconnecté');
  }
});`}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <section className="bg-violet-50 dark:bg-violet-900/10 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Commencer avec LuvviX ID</h2>
        <p className="mb-4">
          Pour commencer à utiliser LuvviX ID dans vos applications, consultez notre documentation détaillée et nos guides d'intégration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Accéder au tableau de bord
          </a>
          <a
            href="/api-docs"
            className="inline-flex items-center justify-center px-4 py-2 border border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
          >
            Documentation API
          </a>
        </div>
      </section>
    </div>
  );
};

export default IDDocs;
