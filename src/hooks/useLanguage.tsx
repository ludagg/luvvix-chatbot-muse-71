
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Translations {
  // Navigation
  nav: {
    home: string;
    explore: string;
    aiStudio: string;
    forms: string;
    cloud: string;
    center: string;
    news: string;
    docs: string;
    account: string;
    login: string;
    logout: string;
    dashboard: string;
  };
  
  // Home page
  home: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      getStarted: string;
      learnMore: string;
    };
    features: {
      title: string;
      aiStudio: {
        title: string;
        description: string;
      };
      forms: {
        title: string;
        description: string;
      };
      cloud: {
        title: string;
        description: string;
      };
      center: {
        title: string;
        description: string;
      };
    };
    testimonials: {
      title: string;
      subtitle: string;
    };
    footer: {
      about: string;
      privacy: string;
      terms: string;
      contact: string;
      copyright: string;
    };
  };
  
  // Explore page
  explore: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    aiConnected: string;
    suggestions: string;
    recentSearches: string;
    trending: string;
    noSearchHistory: string;
    popularSuggestions: string;
    startExploring: string;
    searchContent: string;
    examples: {
      ai: string;
      tech: string;
      recipes: string;
      tutorials: string;
    };
    tabs: {
      all: string;
      web: string;
      videos: string;
      images: string;
      files: string;
    };
    assistant: {
      title: string;
      online: string;
      copilot: string;
      helpText: string;
      thinking: string;
      askQuestion: string;
      actions: {
        summarize: string;
        deepen: string;
        suggestions: string;
        createContent: string;
      };
    };
    fileUploader: {
      analyze: string;
      success: string;
      error: string;
      types: {
        pdf: string;
        image: string;
        audio: string;
        video: string;
        general: string;
      };
    };
    history: {
      title: string;
      recent: string;
      trends: string;
      clear: string;
    };
    results: {
      views: string;
      download: string;
      share: string;
      open: string;
      author: string;
      source: string;
    };
  };
  
  // AI Studio
  aiStudio: {
    title: string;
    subtitle: string;
    createAgent: string;
    marketplace: string;
    myAgents: string;
    chat: string;
    settings: string;
  };
  
  // Forms
  forms: {
    title: string;
    subtitle: string;
    create: string;
    responses: string;
    settings: string;
    analytics: string;
  };
  
  // Cloud
  cloud: {
    title: string;
    subtitle: string;
    upload: string;
    files: string;
    folders: string;
    storage: string;
  };
  
  // Center
  center: {
    title: string;
    subtitle: string;
    feed: string;
    groups: string;
    messages: string;
    profile: string;
    settings: string;
  };
  
  // News
  news: {
    title: string;
    subtitle: string;
    categories: string;
    headlines: string;
    trending: string;
    newsletter: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
    import: string;
    share: string;
    copy: string;
    download: string;
    upload: string;
    preview: string;
    settings: string;
    help: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    cookies: string;
    language: string;
    theme: string;
    account: string;
    profile: string;
    logout: string;
    login: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    submit: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    open: string;
    minimize: string;
    maximize: string;
    refresh: string;
    reload: string;
    reset: string;
    clear: string;
    select: string;
    selectAll: string;
    deselectAll: string;
    none: string;
    all: string;
    yes: string;
    no: string;
    ok: string;
    confirm: string;
    warning: string;
    info: string;
    danger: string;
    light: string;
    dark: string;
    auto: string;
  };
}

const translations: Record<string, Translations> = {
  en: {
    nav: {
      home: "Home",
      explore: "Explore",
      aiStudio: "AI Studio",
      forms: "Forms",
      cloud: "Cloud",
      center: "Center",
      news: "News",
      docs: "Docs",
      account: "Account",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard"
    },
    home: {
      hero: {
        title: "The Future of AI Starts Here",
        subtitle: "LuvviX Ecosystem",
        description: "Discover a complete ecosystem of AI-powered tools to transform your work and creativity.",
        getStarted: "Get Started",
        learnMore: "Learn More"
      },
      features: {
        title: "Powerful Features",
        aiStudio: {
          title: "AI Studio",
          description: "Create and deploy intelligent agents"
        },
        forms: {
          title: "Smart Forms",
          description: "Build intelligent forms with AI"
        },
        cloud: {
          title: "Cloud Storage",
          description: "Secure and intelligent file storage"
        },
        center: {
          title: "Social Center",
          description: "Connect and collaborate with others"
        }
      },
      testimonials: {
        title: "What Our Users Say",
        subtitle: "Join thousands of satisfied users"
      },
      footer: {
        about: "About",
        privacy: "Privacy",
        terms: "Terms",
        contact: "Contact",
        copyright: "© 2024 LuvviX. All rights reserved."
      }
    },
    explore: {
      title: "LuvviX Explore",
      subtitle: "Multimodal AI Search",
      searchPlaceholder: "Search sites, videos, files, or ask a question...",
      aiConnected: "AI Connected",
      suggestions: "AI Suggestions",
      recentSearches: "Recent Searches",
      trending: "Trending",
      noSearchHistory: "No recent searches",
      popularSuggestions: "Popular Suggestions",
      startExploring: "Start your exploration",
      searchContent: "Search web content, videos, images or ask any question",
      examples: {
        ai: "Artificial Intelligence",
        tech: "Technology News",
        recipes: "Cooking Recipes",
        tutorials: "Programming Tutorials"
      },
      tabs: {
        all: "All",
        web: "Web",
        videos: "Videos",
        images: "Images",
        files: "Files"
      },
      assistant: {
        title: "LuvviX AI Assistant",
        online: "Online",
        copilot: "Your AI copilot",
        helpText: "I help you analyze, summarize and deepen your searches",
        thinking: "AI is analyzing results...",
        askQuestion: "Ask the AI a question...",
        actions: {
          summarize: "Summarize results",
          deepen: "Deepen",
          suggestions: "Suggestions",
          createContent: "Create content"
        }
      },
      fileUploader: {
        analyze: "Analyze a file",
        success: "File analyzed successfully",
        error: "Error analyzing file",
        types: {
          pdf: "PDF content extracted:",
          image: "Image analyzed:",
          audio: "Media transcribed:",
          video: "Media transcribed:",
          general: "File analyzed:"
        }
      },
      history: {
        title: "History",
        recent: "Recent searches",
        trends: "Trends",
        clear: "Clear history"
      },
      results: {
        views: "views",
        download: "Download",
        share: "Share",
        open: "Open",
        author: "Author",
        source: "Source"
      }
    },
    aiStudio: {
      title: "AI Studio",
      subtitle: "Create and manage AI agents",
      createAgent: "Create Agent",
      marketplace: "Marketplace",
      myAgents: "My Agents",
      chat: "Chat",
      settings: "Settings"
    },
    forms: {
      title: "Smart Forms",
      subtitle: "Create intelligent forms",
      create: "Create Form",
      responses: "Responses",
      settings: "Settings",
      analytics: "Analytics"
    },
    cloud: {
      title: "LuvviX Cloud",
      subtitle: "Secure file storage",
      upload: "Upload",
      files: "Files",
      folders: "Folders",
      storage: "Storage"
    },
    center: {
      title: "LuvviX Center",
      subtitle: "Social network",
      feed: "Feed",
      groups: "Groups",
      messages: "Messages",
      profile: "Profile",
      settings: "Settings"
    },
    news: {
      title: "LuvviX News",
      subtitle: "Latest news and updates",
      categories: "Categories",
      headlines: "Headlines",
      trending: "Trending",
      newsletter: "Newsletter"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      update: "Update",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      export: "Export",
      import: "Import",
      share: "Share",
      copy: "Copy",
      download: "Download",
      upload: "Upload",
      preview: "Preview",
      settings: "Settings",
      help: "Help",
      about: "About",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookies",
      language: "Language",
      theme: "Theme",
      account: "Account",
      profile: "Profile",
      logout: "Logout",
      login: "Login",
      register: "Register",
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstName: "First Name",
      lastName: "Last Name",
      name: "Name",
      phone: "Phone",
      address: "Address",
      city: "City",
      country: "Country",
      zipCode: "ZIP Code",
      submit: "Submit",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      open: "Open",
      minimize: "Minimize",
      maximize: "Maximize",
      refresh: "Refresh",
      reload: "Reload",
      reset: "Reset",
      clear: "Clear",
      select: "Select",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      none: "None",
      all: "All",
      yes: "Yes",
      no: "No",
      ok: "OK",
      confirm: "Confirm",
      warning: "Warning",
      info: "Information",
      danger: "Danger",
      light: "Light",
      dark: "Dark",
      auto: "Auto"
    }
  },
  fr: {
    nav: {
      home: "Accueil",
      explore: "Explorer",
      aiStudio: "Studio IA",
      forms: "Formulaires",
      cloud: "Cloud",
      center: "Centre",
      news: "Actualités",
      docs: "Documentation",
      account: "Compte",
      login: "Connexion",
      logout: "Déconnexion",
      dashboard: "Tableau de bord"
    },
    home: {
      hero: {
        title: "L'avenir de l'IA commence ici",
        subtitle: "Écosystème LuvviX",
        description: "Découvrez un écosystème complet d'outils alimentés par l'IA pour transformer votre travail et votre créativité.",
        getStarted: "Commencer",
        learnMore: "En savoir plus"
      },
      features: {
        title: "Fonctionnalités Puissantes",
        aiStudio: {
          title: "Studio IA",
          description: "Créez et déployez des agents intelligents"
        },
        forms: {
          title: "Formulaires Intelligents",
          description: "Créez des formulaires intelligents avec l'IA"
        },
        cloud: {
          title: "Stockage Cloud",
          description: "Stockage de fichiers sécurisé et intelligent"
        },
        center: {
          title: "Centre Social",
          description: "Connectez-vous et collaborez avec d'autres"
        }
      },
      testimonials: {
        title: "Ce que disent nos utilisateurs",
        subtitle: "Rejoignez des milliers d'utilisateurs satisfaits"
      },
      footer: {
        about: "À propos",
        privacy: "Confidentialité",
        terms: "Conditions",
        contact: "Contact",
        copyright: "© 2024 LuvviX. Tous droits réservés."
      }
    },
    explore: {
      title: "LuvviX Explorer",
      subtitle: "Recherche IA Multimodale",
      searchPlaceholder: "Rechercher des sites, vidéos, fichiers, ou poser une question...",
      aiConnected: "IA Connectée",
      suggestions: "Suggestions IA",
      recentSearches: "Recherches récentes",
      trending: "Tendances",
      noSearchHistory: "Aucune recherche récente",
      popularSuggestions: "Suggestions populaires",
      startExploring: "Commencez votre exploration",
      searchContent: "Recherchez du contenu web, des vidéos, des images ou posez n'importe quelle question",
      examples: {
        ai: "Intelligence artificielle",
        tech: "Actualités technologie",
        recipes: "Recettes cuisine",
        tutorials: "Tutoriels programmation"
      },
      tabs: {
        all: "Tout",
        web: "Web",
        videos: "Vidéos",
        images: "Images",
        files: "Fichiers"
      },
      assistant: {
        title: "Assistant LuvviX IA",
        online: "En ligne",
        copilot: "Votre copilote IA",
        helpText: "Je vous aide à analyser, résumer et approfondir vos recherches",
        thinking: "L'IA analyse les résultats...",
        askQuestion: "Posez une question à l'IA...",
        actions: {
          summarize: "Résumer les résultats",
          deepen: "Approfondir",
          suggestions: "Suggestions",
          createContent: "Créer du contenu"
        }
      },
      fileUploader: {
        analyze: "Analyser un fichier",
        success: "Fichier analysé avec succès",
        error: "Erreur lors de l'analyse du fichier",
        types: {
          pdf: "Contenu extrait du PDF:",
          image: "Image analysée:",
          audio: "Média transcrit:",
          video: "Média transcrit:",
          general: "Fichier analysé:"
        }
      },
      history: {
        title: "Historique",
        recent: "Recherches récentes",
        trends: "Tendances",
        clear: "Effacer l'historique"
      },
      results: {
        views: "vues",
        download: "Télécharger",
        share: "Partager",
        open: "Ouvrir",
        author: "Auteur",
        source: "Source"
      }
    },
    aiStudio: {
      title: "Studio IA",
      subtitle: "Créer et gérer des agents IA",
      createAgent: "Créer un Agent",
      marketplace: "Marketplace",
      myAgents: "Mes Agents",
      chat: "Chat",
      settings: "Paramètres"
    },
    forms: {
      title: "Formulaires Intelligents",
      subtitle: "Créer des formulaires intelligents",
      create: "Créer un Formulaire",
      responses: "Réponses",
      settings: "Paramètres",
      analytics: "Analytiques"
    },
    cloud: {
      title: "LuvviX Cloud",
      subtitle: "Stockage de fichiers sécurisé",
      upload: "Téléverser",
      files: "Fichiers",
      folders: "Dossiers",
      storage: "Stockage"
    },
    center: {
      title: "LuvviX Centre",
      subtitle: "Réseau social",
      feed: "Fil d'actualité",
      groups: "Groupes",
      messages: "Messages",
      profile: "Profil",
      settings: "Paramètres"
    },
    news: {
      title: "LuvviX Actualités",
      subtitle: "Dernières nouvelles et mises à jour",
      categories: "Catégories",
      headlines: "Gros titres",
      trending: "Tendances",
      newsletter: "Newsletter"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      create: "Créer",
      update: "Mettre à jour",
      search: "Rechercher",
      filter: "Filtrer",
      sort: "Trier",
      export: "Exporter",
      import: "Importer",
      share: "Partager",
      copy: "Copier",
      download: "Télécharger",
      upload: "Téléverser",
      preview: "Aperçu",
      settings: "Paramètres",
      help: "Aide",
      about: "À propos",
      contact: "Contact",
      privacy: "Politique de confidentialité",
      terms: "Conditions d'utilisation",
      cookies: "Cookies",
      language: "Langue",
      theme: "Thème",
      account: "Compte",
      profile: "Profil",
      logout: "Déconnexion",
      login: "Connexion",
      register: "S'inscrire",
      forgotPassword: "Mot de passe oublié",
      resetPassword: "Réinitialiser le mot de passe",
      email: "E-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      firstName: "Prénom",
      lastName: "Nom",
      name: "Nom",
      phone: "Téléphone",
      address: "Adresse",
      city: "Ville",
      country: "Pays",
      zipCode: "Code postal",
      submit: "Soumettre",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      close: "Fermer",
      open: "Ouvrir",
      minimize: "Réduire",
      maximize: "Agrandir",
      refresh: "Actualiser",
      reload: "Recharger",
      reset: "Réinitialiser",
      clear: "Effacer",
      select: "Sélectionner",
      selectAll: "Tout sélectionner",
      deselectAll: "Tout désélectionner",
      none: "Aucun",
      all: "Tout",
      yes: "Oui",
      no: "Non",
      ok: "OK",
      confirm: "Confirmer",
      warning: "Avertissement",
      info: "Information",
      danger: "Danger",
      light: "Clair",
      dark: "Sombre",
      auto: "Auto"
    }
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  languages: Language[];
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('luvvix-language');
    return saved || 'fr';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('luvvix-language', lang);
  };

  const t = translations[language] || translations.fr;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages, t }}>
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
