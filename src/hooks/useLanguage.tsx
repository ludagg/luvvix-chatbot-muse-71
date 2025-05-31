
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: Language[];
}

const translations = {
  fr: {
    // Navigation
    'nav.applications': 'Applications',
    'nav.ecosystem': 'Écosystème',
    'nav.news': 'Actualités',
    'nav.login': 'Connexion',
    'nav.signin': 'Se connecter',
    'nav.signup': 'S\'inscrire',
    'nav.signout': 'Se déconnecter',
    
    // Applications
    'app.aiStudio': 'AI Studio',
    'app.aiStudio.desc': 'Studio de création d\'agents IA',
    'app.translate': 'Traducteur',
    'app.translate.desc': 'Traduction multilingue avancée',
    'app.mindmap': 'Carte Mentale',
    'app.mindmap.desc': 'Créez des cartes mentales intelligentes',
    'app.codeStudio': 'Code Studio',
    'app.codeStudio.desc': 'Développement assisté par IA',
    'app.forms': 'Formulaires',
    'app.forms.desc': 'Créateur de formulaires intelligent',
    'app.cloud': 'Cloud',
    'app.cloud.desc': 'Stockage et collaboration cloud',
    'app.news': 'Actualités',
    'app.news.desc': 'Flux d\'actualités personnalisé',
    'app.weather': 'Météo',
    'app.weather.desc': 'Prévisions météorologiques',
    'app.streamMix': 'Stream Mix',
    'app.streamMix.desc': 'Streaming multimédia',
    'app.complete': 'Écosystème Complet',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue sur LuvviX',
    'dashboard.stats': 'Statistiques',
    'dashboard.recent': 'Activités récentes',
    
    // Explore
    'explore.title': 'LuvviX Explore',
    'explore.subtitle': 'Recherche IA Multimodale',
    'explore.search.placeholder': 'Rechercher des sites, vidéos, fichiers, ou poser une question...',
    'explore.ai.connected': 'IA Connectée',
    'explore.ai.thinking': 'L\'IA réfléchit...',
    'explore.ai.placeholder': 'Posez une question à l\'IA...',
    'explore.ai.send': 'Envoyer',
    'explore.suggestions': 'Suggestions IA',
    'explore.history': 'Recherches récentes',
    'explore.history.clear': 'Effacer l\'historique',
    'explore.results.all': 'Tout',
    'explore.results.web': 'Web',
    'explore.results.videos': 'Vidéos',
    'explore.results.images': 'Images',
    'explore.results.files': 'Fichiers',
    'explore.start.title': 'Commencez votre exploration',
    'explore.start.subtitle': 'Recherchez du contenu web, des vidéos, des images ou posez n\'importe quelle question',
    'explore.file.upload': 'Analyser un fichier',
    'explore.file.analyzing': 'Analyse en cours...',
    'explore.examples.ai': 'Intelligence artificielle',
    'explore.examples.tech': 'Actualités technologie',
    'explore.examples.cooking': 'Recettes cuisine',
    'explore.examples.programming': 'Tutoriels programmation',
    
    // MindMap
    'mindmap.title': 'LuvviX MindMap',
    'mindmap.subtitle': 'Cartes Mentales Intelligentes',
    'mindmap.description': 'Créez des cartes mentales interactives avec l\'aide de l\'intelligence artificielle',
    
    // Footer
    'footer.description': 'Plateforme d\'intelligence artificielle nouvelle génération pour créer, collaborer et innover.',
    'footer.products': 'Produits',
    'footer.resources': 'Ressources',
    'footer.legal': 'Légal',
    'footer.documentation': 'Documentation',
    'footer.api': 'API',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.cookies': 'Cookies',
    'footer.copyright': '© 2024 LuvviX. Tous droits réservés.',
    'footer.availableLanguages': 'Langues disponibles',
    
    // Common
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.share': 'Partager',
    'common.download': 'Télécharger',
    'common.upload': 'Téléverser',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',
    'common.more': 'Plus',
    'common.less': 'Moins',
    'common.view': 'Voir',
    'common.views': 'vues',
    'common.author': 'Auteur',
    'common.date': 'Date',
    'common.duration': 'Durée',
    'common.source': 'Source'
  },
  en: {
    // Navigation
    'nav.applications': 'Applications',
    'nav.ecosystem': 'Ecosystem',
    'nav.news': 'News',
    'nav.login': 'Login',
    'nav.signin': 'Sign in',
    'nav.signup': 'Sign up',
    'nav.signout': 'Sign out',
    
    // Applications
    'app.aiStudio': 'AI Studio',
    'app.aiStudio.desc': 'AI agent creation studio',
    'app.translate': 'Translator',
    'app.translate.desc': 'Advanced multilingual translation',
    'app.mindmap': 'Mind Map',
    'app.mindmap.desc': 'Create intelligent mind maps',
    'app.codeStudio': 'Code Studio',
    'app.codeStudio.desc': 'AI-assisted development',
    'app.forms': 'Forms',
    'app.forms.desc': 'Intelligent form creator',
    'app.cloud': 'Cloud',
    'app.cloud.desc': 'Cloud storage and collaboration',
    'app.news': 'News',
    'app.news.desc': 'Personalized news feed',
    'app.weather': 'Weather',
    'app.weather.desc': 'Weather forecasts',
    'app.streamMix': 'Stream Mix',
    'app.streamMix.desc': 'Multimedia streaming',
    'app.complete': 'Complete Ecosystem',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to LuvviX',
    'dashboard.stats': 'Statistics',
    'dashboard.recent': 'Recent activities',
    
    // Explore
    'explore.title': 'LuvviX Explore',
    'explore.subtitle': 'Multimodal AI Search',
    'explore.search.placeholder': 'Search websites, videos, files, or ask a question...',
    'explore.ai.connected': 'AI Connected',
    'explore.ai.thinking': 'AI is thinking...',
    'explore.ai.placeholder': 'Ask the AI a question...',
    'explore.ai.send': 'Send',
    'explore.suggestions': 'AI Suggestions',
    'explore.history': 'Recent searches',
    'explore.history.clear': 'Clear history',
    'explore.results.all': 'All',
    'explore.results.web': 'Web',
    'explore.results.videos': 'Videos',
    'explore.results.images': 'Images',
    'explore.results.files': 'Files',
    'explore.start.title': 'Start your exploration',
    'explore.start.subtitle': 'Search web content, videos, images or ask any question',
    'explore.file.upload': 'Analyze a file',
    'explore.file.analyzing': 'Analyzing...',
    'explore.examples.ai': 'Artificial intelligence',
    'explore.examples.tech': 'Technology news',
    'explore.examples.cooking': 'Cooking recipes',
    'explore.examples.programming': 'Programming tutorials',
    
    // MindMap
    'mindmap.title': 'LuvviX MindMap',
    'mindmap.subtitle': 'Intelligent Mind Maps',
    'mindmap.description': 'Create interactive mind maps with artificial intelligence assistance',
    
    // Footer
    'footer.description': 'Next-generation artificial intelligence platform for creating, collaborating and innovating.',
    'footer.products': 'Products',
    'footer.resources': 'Resources',
    'footer.legal': 'Legal',
    'footer.documentation': 'Documentation',
    'footer.api': 'API',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookies',
    'footer.copyright': '© 2024 LuvviX. All rights reserved.',
    'footer.availableLanguages': 'Available languages',
    
    // Common
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.share': 'Share',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.more': 'More',
    'common.less': 'Less',
    'common.view': 'View',
    'common.views': 'views',
    'common.author': 'Author',
    'common.date': 'Date',
    'common.duration': 'Duration',
    'common.source': 'Source'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('fr');

  const languages: Language[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('luvvix-language');
    if (saved && ['fr', 'en'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('luvvix-language', lang);
  };

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.fr;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t,
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
