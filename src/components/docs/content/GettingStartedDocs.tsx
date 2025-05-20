
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GettingStartedDocs = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4">Commencer avec LuvviX</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Bienvenue dans la documentation LuvviX ! Découvrez comment utiliser nos produits pour créer des expériences interactives puissantes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">LuvviX AI Studio</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Créez et déployez des agents IA conversationnels personnalisés sans code.
            </p>
            <a href="/docs/ai-studio" className="text-violet-600 dark:text-violet-400 hover:underline">
              Découvrir AI Studio →
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">LuvviX Forms</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Créez des formulaires interactifs et collectez des données facilement.
            </p>
            <a href="/docs/forms" className="text-violet-600 dark:text-violet-400 hover:underline">
              Découvrir Forms →
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">LuvviX ID</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Système d'authentification unifié pour tous les produits LuvviX et plus encore.
            </p>
            <a href="/docs/id" className="text-violet-600 dark:text-violet-400 hover:underline">
              Découvrir LuvviX ID →
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">APIs</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Intégrez les fonctionnalités LuvviX directement dans vos applications.
            </p>
            <a href="/docs/api" className="text-violet-600 dark:text-violet-400 hover:underline">
              Explorer les APIs →
            </a>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Guide de démarrage rapide</h2>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account">Créer un compte</TabsTrigger>
            <TabsTrigger value="project">Premier projet</TabsTrigger>
            <TabsTrigger value="deploy">Déploiement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <h3 className="text-xl font-medium">1. Créer votre compte LuvviX</h3>
            <p>
              Commencez par créer un compte LuvviX pour accéder à tous nos produits et services.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-3">
                <li>Visitez <a href="/auth" className="text-violet-600 dark:text-violet-400 hover:underline">luvvix.it.com/auth</a>.</li>
                <li>Cliquez sur "Créer un compte" et remplissez le formulaire d'inscription.</li>
                <li>Vérifiez votre adresse e-mail en cliquant sur le lien dans l'e-mail de confirmation.</li>
                <li>Connectez-vous avec vos identifiants pour accéder à votre tableau de bord.</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="project" className="space-y-4">
            <h3 className="text-xl font-medium">2. Créer votre premier projet</h3>
            <p>
              Après avoir créé votre compte, vous pouvez commencer à utiliser n'importe lequel de nos produits.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-3">
                <li>Accédez à votre tableau de bord via <a href="/dashboard" className="text-violet-600 dark:text-violet-400 hover:underline">luvvix.it.com/dashboard</a>.</li>
                <li>Choisissez le produit que vous souhaitez utiliser (AI Studio, Forms, etc.).</li>
                <li>Suivez les instructions à l'écran pour créer votre premier projet.</li>
                <li>Personnalisez votre projet selon vos besoins.</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="deploy" className="space-y-4">
            <h3 className="text-xl font-medium">3. Déployer votre projet</h3>
            <p>
              Une fois votre projet prêt, vous pouvez le déployer et le partager avec d'autres personnes.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-3">
                <li>Dans votre projet, cliquez sur le bouton "Publier" ou "Déployer".</li>
                <li>Configurez les paramètres de partage selon vos préférences.</li>
                <li>Copiez le lien ou le code d'intégration généré.</li>
                <li>Partagez le lien ou intégrez le code dans votre site web.</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      <section className="bg-violet-50 dark:bg-violet-900/10 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Besoin d'aide ?</h2>
        <p className="mb-4">
          Si vous avez des questions ou rencontrez des difficultés, notre équipe de support est là pour vous aider.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:support@luvvix.it.com"
            className="inline-flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Contacter le support
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center px-4 py-2 border border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
          >
            Consulter la FAQ
          </a>
        </div>
      </section>
    </div>
  );
};

export default GettingStartedDocs;
