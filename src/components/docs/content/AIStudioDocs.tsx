
import { useState } from "react";

const AIStudioDocs = () => {
  const [selectedEmbedTab, setSelectedEmbedTab] = useState('iframe');

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4">LuvviX AI Studio</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Créez, personnalisez et déployez des agents IA conversationnels sans connaissances techniques.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Créer un agent IA</h2>
        <p>
          LuvviX AI Studio vous permet de créer des agents IA sans code. 
          Ces agents peuvent être formés pour répondre à des questions spécifiques, 
          fournir des informations ou interagir avec vos utilisateurs.
        </p>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium">Étapes pour créer un agent</h3>
          </div>
          <div className="p-4">
            <ol className="list-decimal list-inside space-y-3">
              <li>Accédez à <a href="/ai-studio" className="text-violet-600 dark:text-violet-400 hover:underline">LuvviX AI Studio</a>.</li>
              <li>Cliquez sur "Créer un agent".</li>
              <li>Donnez un nom et définissez l'objectif de votre agent.</li>
              <li>Choisissez un style de personnalité (expert, amical, concis, etc.).</li>
              <li>Ajoutez du contexte pour votre agent (texte, URLs, documents).</li>
              <li>Testez votre agent dans l'interface de chat.</li>
              <li>Une fois satisfait, publiez votre agent.</li>
            </ol>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Ajouter du contexte</h2>
        <p>
          Le contexte est essentiel pour que votre agent IA puisse fournir des réponses précises et pertinentes.
          LuvviX AI Studio vous permet d'ajouter du contexte de différentes façons.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Texte direct</h3>
            <p className="text-sm mb-3">
              Ajoutez du texte directement dans l'éditeur de contexte pour donner des informations spécifiques à votre agent.
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
              <code>Notre entreprise offre des services de consultation en marketing digital depuis 2015...</code>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">URLs</h3>
            <p className="text-sm mb-3">
              Fournissez des liens vers des pages web contenant des informations pertinentes pour votre agent.
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
              <code>https://votresite.com/a-propos</code><br />
              <code>https://votresite.com/faq</code>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Documents</h3>
            <p className="text-sm mb-3">
              Téléchargez des documents (PDF, DOCX, etc.) contenant des informations que votre agent devrait connaître.
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
              <code>guide-produit.pdf</code><br />
              <code>specifications-techniques.docx</code>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">API</h3>
            <p className="text-sm mb-3">
              Pour les utilisateurs avancés, intégrez des sources de données dynamiques via notre API REST.
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
              <code>POST /api/agents/:id/context</code>
            </div>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Personnalisation</h2>
        <p>
          Personnalisez l'apparence et le comportement de votre agent pour l'adapter à votre marque et à vos besoins spécifiques.
        </p>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium">Options de personnalisation</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Avatar</strong> - Choisissez parmi une variété de styles d'avatar ou téléchargez votre propre image.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Personnalité</strong> - Définissez le ton et le style de communication (expert, amical, concis, empathique).</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Interface</strong> - Personnalisez les couleurs et l'apparence de l'interface de chat.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Options avancées</strong> - Contrôlez les paramètres de réponse comme la longueur, la créativité, etc.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Intégration</h2>
        <p>
          Une fois votre agent créé et personnalisé, vous pouvez facilement l'intégrer sur votre site web ou application.
          LuvviX AI Studio offre plusieurs options d'intégration.
        </p>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex space-x-4">
              <button 
                className={`text-sm py-1 px-3 rounded ${selectedEmbedTab === 'iframe' ? 'bg-violet-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setSelectedEmbedTab('iframe')}
              >
                iFrame
              </button>
              <button 
                className={`text-sm py-1 px-3 rounded ${selectedEmbedTab === 'script' ? 'bg-violet-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setSelectedEmbedTab('script')}
              >
                Script
              </button>
              <button 
                className={`text-sm py-1 px-3 rounded ${selectedEmbedTab === 'widget' ? 'bg-violet-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setSelectedEmbedTab('widget')}
              >
                Widget flottant
              </button>
            </div>
          </div>
          <div className="p-4">
            {selectedEmbedTab === 'iframe' && (
              <>
                <p className="text-sm mb-3">
                  Intégrez votre agent dans une iframe - la méthode la plus simple pour ajouter un assistant IA à votre site.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                  <code>{`<iframe
  src="https://luvvix.it.com/ai-embed/AGENT_ID"
  width="100%"
  height="600px"
  style="border:1px solid #e5e7eb; border-radius: 0.5rem;"
  title="LuvviX AI Assistant"
></iframe>`}</code>
                </div>
              </>
            )}
            
            {selectedEmbedTab === 'script' && (
              <>
                <p className="text-sm mb-3">
                  Utilisez notre script JavaScript pour une intégration plus personnalisable.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                  <code>{`<div id="luvvix-ai-AGENT_ID"></div>
<script src="https://luvvix.it.com/api/embed.js" data-agent-id="AGENT_ID"></script>`}</code>
                </div>
              </>
            )}
            
            {selectedEmbedTab === 'widget' && (
              <>
                <p className="text-sm mb-3">
                  Ajoutez un widget de chat flottant que vos utilisateurs peuvent activer à tout moment.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                  <code>{`<script>
  window.luvvixSettings = {
    agentId: "AGENT_ID",
    position: "bottom-right", // Options: bottom-right, bottom-left, top-right, top-left
    theme: "dark" // Options: dark, light
  };
</script>
<script src="https://luvvix.it.com/api/embed-floating.js" async></script>`}</code>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      
      <section className="bg-violet-50 dark:bg-violet-900/10 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Prêt à commencer ?</h2>
        <p className="mb-4">
          Créez votre premier agent IA en quelques minutes et offrez une expérience conversationnelle exceptionnelle à vos utilisateurs.
        </p>
        <a
          href="/ai-studio/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Créer un agent IA
        </a>
      </section>
    </div>
  );
};

export default AIStudioDocs;
