
import { Book, FileText, User, Bot, Code, Home } from 'lucide-react';

interface DocsSidebarProps {
  currentDoc: string;
  onSelectDoc: (doc: string) => void;
}

const DocsSidebar = ({ currentDoc, onSelectDoc }: DocsSidebarProps) => {
  const docSections = [
    {
      id: 'getting-started',
      label: 'Commencer',
      icon: Home,
      subsections: [
        { id: 'introduction', label: 'Introduction' },
        { id: 'quick-start', label: 'Guide rapide' },
        { id: 'installation', label: 'Installation' }
      ]
    },
    {
      id: 'ai-studio',
      label: 'AI Studio',
      icon: Bot,
      subsections: [
        { id: 'creating-agents', label: 'Créer des agents' },
        { id: 'training', label: 'Entraînement' },
        { id: 'embedding', label: 'Intégration' },
        { id: 'context', label: 'Contexte' }
      ]
    },
    {
      id: 'forms',
      label: 'Forms',
      icon: FileText,
      subsections: [
        { id: 'form-builder', label: 'Créateur de formulaires' },
        { id: 'question-types', label: 'Types de questions' },
        { id: 'responses', label: 'Réponses' },
        { id: 'sharing', label: 'Partage' }
      ]
    },
    {
      id: 'id',
      label: 'LuvviX ID',
      icon: User,
      subsections: [
        { id: 'authentication', label: 'Authentification' },
        { id: 'oauth', label: 'OAuth' },
        { id: 'sso', label: 'SSO' }
      ]
    },
    {
      id: 'api',
      label: 'API',
      icon: Code,
      subsections: [
        { id: 'ai-api', label: 'AI API' },
        { id: 'forms-api', label: 'Forms API' },
        { id: 'id-api', label: 'ID API' }
      ]
    }
  ];
  
  return (
    <div className="h-full overflow-y-auto py-4">
      <div className="px-6 py-4">
        <h2 className="text-xl font-bold flex items-center">
          <Book className="mr-2" size={20} />
          Documentation
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Guides et références pour les produits LuvviX
        </p>
      </div>
      
      <nav className="mt-6">
        {docSections.map((section) => (
          <div key={section.id} className="mb-6">
            <div
              className={`
                flex items-center px-6 py-2 cursor-pointer
                ${currentDoc === section.id ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
              onClick={() => onSelectDoc(section.id)}
            >
              <section.icon className="mr-2" size={18} />
              <span className="font-medium">{section.label}</span>
            </div>
            
            {section.subsections && (
              <div className={`ml-8 mt-2 ${currentDoc === section.id ? 'block' : 'hidden'}`}>
                {section.subsections.map((subsection) => (
                  <div
                    key={subsection.id}
                    className="px-4 py-1.5 text-sm cursor-pointer hover:text-violet-600 dark:hover:text-violet-400"
                    onClick={() => onSelectDoc(`${section.id}/${subsection.id}`)}
                  >
                    {subsection.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      <div className="px-6 pt-6 mt-6 border-t">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Besoin d'aide supplémentaire ?
        </div>
        <div className="mt-2">
          <a
            href="mailto:support@luvvix.it.com"
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
          >
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocsSidebar;
