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
    navigator.clipboard.writeText("npm install luvvix-cameroon-sdk");
    setNpmCopied(true);
  };

  const copyApiUrl = () => {
    navigator.clipboard.writeText("https://api.luvvix.cm/v1");
    setApiUrlCopied(true);
  };

  return (
    <section id="developer" className="py-20 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Solutions pour Développeurs Camerounais</h2>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Intégrez facilement LuvviX ID dans vos applications avec notre SDK ou API REST adaptés au marché africain
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="sdk" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="sdk">SDK LuvviX</TabsTrigger>
              <TabsTrigger value="rest">API REST</TabsTrigger>
            </TabsList>

            <TabsContent value="sdk">
              {/* SDK Installation */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Code className="mr-2 text-purple-600" size={20} />
                    Installation du SDK LuvviX
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
                  npm install luvvix-cameroon-sdk
                </div>
                
                <p className="text-gray-700 text-sm mb-4">
                  Le SDK LuvviX est spécialement conçu pour les développeurs camerounais et africains, 
                  avec support des langues locales et intégration des solutions de paiement mobile.
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
                        onClick={() => copyToClipboard(javascriptExampleCameroon, "js")}
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
                        {javascriptExampleCameroon}
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="react" className="relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(reactExampleCameroon, "react")}
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
                        {reactExampleCameroon}
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="vue" className="relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(vueExampleCameroon, "vue")}
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
                        {vueExampleCameroon}
                      </pre>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-8 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Documentation complète</h4>
                    <p className="text-gray-700 text-sm mb-4">
                      Documentation complète avec exemples spécifiques pour le marché camerounais, 
                      intégration Mobile Money et Orange Money.
                    </p>
                    <Button 
                      variant="outline" 
                      className="flex items-center"
                      onClick={() => window.open("https://docs.luvvix.cm", "_blank")}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Documentation LuvviX Cameroun
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
                    API REST LuvviX Cameroun
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
                  Base URL: https://api.luvvix.cm/v1
                </div>

                <div className="space-y-8">
                  {/* Authentication */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Authentification</h4>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Utilisez votre clé API LuvviX Cameroun dans l'en-tête :
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        {`Authorization: Bearer LUVVIX_CM_API_KEY`}
                      </pre>
                    </div>
                  </div>

                  {/* Endpoints Cameroun */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Endpoints Cameroun</h4>
                    
                    {/* Verify Token */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-2">Vérifier un token utilisateur</h5>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`POST /auth/verify-cm
Content-Type: application/json

{
  "token": "user_access_token",
  "region": "cameroon"
}`}
                      </pre>
                    </div>

                    {/* Get User Info */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-2">Obtenir les informations utilisateur</h5>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`GET /users/profile-cm
Authorization: Bearer user_access_token
X-Region: cameroon`}
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

                    {/* Paiement Mobile Money */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-2">Paiement Mobile Money</h5>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`POST /payments/mobile-money
Content-Type: application/json

{
  "amount": 5000,
  "currency": "XAF",
  "phone": "+237612345678",
  "provider": "orange_cm"
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
                  <h4 className="font-medium mb-2">Support Développeurs Cameroun</h4>
                  <p className="text-gray-700 text-sm mb-4">
                    Support technique en français, intégration avec les banques camerounaises, 
                    et documentation adaptée au contexte local.
                  </p>
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => window.open("https://support.luvvix.cm", "_blank")}
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Support Technique Cameroun
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

// Code examples adapted for Cameroon
const javascriptExampleCameroon = `// SDK LuvviX Cameroun
import { LuvviXCameroon } from 'luvvix-cameroon-sdk';

const luvvix = new LuvviXCameroon({
  apiKey: 'your-api-key',
  region: 'cameroon',
  language: 'fr', // français par défaut
  currency: 'XAF'
});

// Authentification avec numéro de téléphone camerounais
async function loginWithPhone() {
  try {
    const result = await luvvix.auth.loginWithPhone({
      phone: '+237612345678',
      countryCode: 'CM'
    });
    console.log('Connexion réussie:', result);
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
}

// Paiement Mobile Money
async function payWithMobileMoney() {
  const payment = await luvvix.payments.mobileMoney({
    amount: 5000, // en FCFA
    phone: '+237612345678',
    provider: 'orange_cm' // ou 'mtn_cm'
  });
  return payment;
}`;

const reactExampleCameroon = `// Composant React pour LuvviX Cameroun
import React from 'react';
import { useLuvviXCameroon } from 'luvvix-cameroon-sdk/react';

function AuthCameroon() {
  const { user, login, logout, payMobileMoney } = useLuvviXCameroon({
    region: 'cameroon',
    language: 'fr'
  });

  const handleMobileMoneyPayment = async () => {
    try {
      const payment = await payMobileMoney({
        amount: 5000,
        phone: '+237612345678',
        provider: 'orange_cm'
      });
      alert('Paiement réussi!');
    } catch (error) {
      alert('Erreur de paiement');
    }
  };

  return (
    <div className="auth-cameroon">
      {user ? (
        <div>
          <p>Bienvenue {user.name}</p>
          <button onClick={handleMobileMoneyPayment}>
            Payer avec Orange Money
          </button>
          <button onClick={logout}>Se déconnecter</button>
        </div>
      ) : (
        <button onClick={() => login({ region: 'cameroon' })}>
          Se connecter avec LuvviX
        </button>
      )}
    </div>
  );
}`;

const vueExampleCameroon = `<!-- Composant Vue.js pour LuvviX Cameroun -->
<template>
  <div class="auth-cameroon">
    <div v-if="user">
      <p>Bienvenue {{ user.name }}</p>
      <button @click="payWithOrangeMoney">Payer avec Orange Money</button>
      <button @click="logout">Se déconnecter</button>
    </div>
    <div v-else>
      <button @click="login">Se connecter avec LuvviX</button>
    </div>
  </div>
</template>

<script>
import { LuvviXCameroon } from 'luvvix-cameroon-sdk';

export default {
  data() {
    return {
      user: null,
      luvvix: new LuvviXCameroon({
        region: 'cameroon',
        language: 'fr'
      })
    };
  },
  methods: {
    async login() {
      this.user = await this.luvvix.auth.login({
        region: 'cameroon'
      });
    },
    async payWithOrangeMoney() {
      await this.luvvix.payments.mobileMoney({
        amount: 5000,
        provider: 'orange_cm',
        phone: '+237612345678'
      });
    },
    logout() {
      this.luvvix.auth.logout();
      this.user = null;
    }
  }
};
</script>`;

export default DeveloperSection;
