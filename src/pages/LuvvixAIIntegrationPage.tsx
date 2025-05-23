
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Download, ExternalLink, Key, LockKeyhole, Shield } from "lucide-react";

const LuvvixAIIntegrationPage = () => {
  React.useEffect(() => {
    document.title = "Intégration LuvviX AI | LuvviX ID";
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-4">Intégration LuvviX AI avec LuvviX ID</h1>
              <p className="text-gray-600 text-lg">
                Connectez votre application LuvviX AI externe avec notre système d'authentification centralisé
              </p>
            </div>

            <Tabs defaultValue="integration" className="space-y-8">
              <TabsList className="grid grid-cols-3 max-w-lg mx-auto">
                <TabsTrigger value="integration">Présentation</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
                <TabsTrigger value="ressources">Ressources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="integration">
                <Card>
                  <CardHeader>
                    <CardTitle>Comment ça fonctionne</CardTitle>
                    <CardDescription>
                      LuvviX AI peut s'intégrer facilement avec LuvviX ID pour une authentification centralisée
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="bg-luvvix-purple/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                          <LockKeyhole className="text-luvvix-purple h-6 w-6" />
                        </div>
                        <h3 className="font-medium">1. Connexion</h3>
                        <p className="text-sm text-gray-600">L'utilisateur se connecte à LuvviX ID</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="bg-luvvix-purple/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                          <Key className="text-luvvix-purple h-6 w-6" />
                        </div>
                        <h3 className="font-medium">2. Génération de token</h3>
                        <p className="text-sm text-gray-600">Un token d'authentification est généré</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="bg-luvvix-purple/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                          <Shield className="text-luvvix-purple h-6 w-6" />
                        </div>
                        <h3 className="font-medium">3. Accès sécurisé</h3>
                        <p className="text-sm text-gray-600">L'utilisateur accède à LuvviX AI</p>
                      </div>
                    </div>

                    <div className="border-t border-b py-6 my-6">
                      <h3 className="font-semibold text-lg mb-4">Avantages de l'intégration</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Authentification unifiée dans tout l'écosystème LuvviX</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Pas besoin de créer un nouveau compte pour LuvviX AI</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Sécurité renforcée et conformité avec les normes</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Intégration technique simplifiée avec notre SDK</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                      <h3 className="font-semibold mb-3">Vous avez déjà un compte LuvviX ID?</h3>
                      <p className="text-gray-600 mb-4">
                        Connectez-vous pour accéder directement à LuvviX AI sans créer un nouveau compte.
                      </p>
                      <Button className="bg-luvvix-purple hover:bg-luvvix-darkpurple">
                        <Link to="https://luvvix-ai.example.com/auth/luvvix" className="flex items-center">
                          Accéder à LuvviX AI
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentation">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentation technique</CardTitle>
                    <CardDescription>
                      Guide d'implémentation pour les développeurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Installation</h3>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                        <code className="text-sm">
                          &lt;script src="https://luvvix.it.com/api/luvvix-auth-integration.js"&gt;&lt;/script&gt;
                        </code>
                      </div>

                      <h3 className="font-semibold text-lg mt-6">Configuration de base</h3>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
                          {`// Initialiser l'intégration
LuvvixAuthIntegration.init({
  // Options de configuration personnalisées si nécessaire
});

// Vérifier si l'utilisateur est authentifié
const isLoggedIn = LuvvixAuthIntegration.isAuthenticated();

// Obtenir les informations de l'utilisateur
const user = LuvvixAuthIntegration.getUser();`}
                        </pre>
                      </div>

                      <h3 className="font-semibold text-lg mt-6">Configuration des routes</h3>
                      <p className="text-gray-600 mb-2">
                        Configurez ces deux routes dans votre application pour gérer l'authentification:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><code>/auth/luvvix</code> - Pour recevoir le token depuis LuvviX ID</li>
                        <li><code>/auth/callback</code> - Pour finaliser l'authentification</li>
                      </ul>

                      <div className="mt-6 border-t pt-6">
                        <h3 className="font-semibold text-lg">Événements disponibles</h3>
                        <ul className="space-y-2 mt-3">
                          <li className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 rounded mr-2">luvvix_login</code>
                            <span className="text-gray-600">- Déclenché lors d'une connexion réussie</span>
                          </li>
                          <li className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 rounded mr-2">luvvix_logout</code>
                            <span className="text-gray-600">- Déclenché lors d'une déconnexion</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Link to="/docs/LuvvixAIIntegration" className="flex items-center justify-center w-full">
                        <Code className="mr-2 h-4 w-4" />
                        Voir la documentation complète
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="ressources">
                <Card>
                  <CardHeader>
                    <CardTitle>Ressources pour développeurs</CardTitle>
                    <CardDescription>
                      Téléchargez nos outils et consultez nos guides pour faciliter l'intégration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Script d'intégration LuvviX ID</h3>
                          <p className="text-sm text-gray-600">Version 1.0.0</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Exemple d'intégration (React)</h3>
                          <p className="text-sm text-gray-600">Implémentation React complète</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Exemple d'intégration (Vue)</h3>
                          <p className="text-sm text-gray-600">Implémentation Vue.js complète</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="font-semibold text-lg mb-4">Support technique</h3>
                      <p className="text-gray-600 mb-4">
                        Besoin d'aide avec l'intégration? Notre équipe de support est disponible pour vous assister.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline">Documentation API</Button>
                        <Button variant="outline">Forum développeurs</Button>
                        <Button variant="outline">Contacter le support</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LuvvixAIIntegrationPage;
