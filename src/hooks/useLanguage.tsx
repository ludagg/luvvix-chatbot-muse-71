
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  'nav.home': {
    fr: 'Accueil',
    en: 'Home',
    es: 'Inicio',
    de: 'Startseite',
    it: 'Home',
    pt: 'Início',
    ru: 'Главная',
    zh: '首页',
    ja: 'ホーム'
  },
  'nav.news': {
    fr: 'Actualités',
    en: 'News',
    es: 'Noticias',
    de: 'Nachrichten',
    it: 'Notizie',
    pt: 'Notícias',
    ru: 'Новости',
    zh: '新闻',
    ja: 'ニュース'
  },
  'nav.translate': {
    fr: 'Traduire',
    en: 'Translate',
    es: 'Traducir',
    de: 'Übersetzen',
    it: 'Traduci',
    pt: 'Traduzir',
    ru: 'Перевести',
    zh: '翻译',
    ja: '翻訳'
  },
  'nav.mindmap': {
    fr: 'Carte mentale',
    en: 'Mind Map',
    es: 'Mapa mental',
    de: 'Mindmap',
    it: 'Mappa mentale',
    pt: 'Mapa mental',
    ru: 'Ментальная карта',
    zh: '思维导图',
    ja: 'マインドマップ'
  },
  'nav.weather': {
    fr: 'Météo',
    en: 'Weather',
    es: 'Clima',
    de: 'Wetter',
    it: 'Meteo',
    pt: 'Clima',
    ru: 'Погода',
    zh: '天气',
    ja: '天気'
  },
  'nav.explore': {
    fr: 'Explorer',
    en: 'Explore',
    es: 'Explorar',
    de: 'Erkunden',
    it: 'Esplora',
    pt: 'Explorar',
    ru: 'Исследовать',
    zh: '探索',
    ja: '探索'
  },
  'nav.dashboard': {
    fr: 'Tableau de bord',
    en: 'Dashboard',
    es: 'Panel',
    de: 'Dashboard',
    it: 'Dashboard',
    pt: 'Painel',
    ru: 'Панель',
    zh: '仪表板',
    ja: 'ダッシュボード'
  },
  'nav.login': {
    fr: 'Connexion',
    en: 'Login',
    es: 'Iniciar sesión',
    de: 'Anmelden',
    it: 'Accedi',
    pt: 'Entrar',
    ru: 'Войти',
    zh: '登录',
    ja: 'ログイン'
  },
  'nav.logout': {
    fr: 'Déconnexion',
    en: 'Logout',
    es: 'Cerrar sesión',
    de: 'Abmelden',
    it: 'Esci',
    pt: 'Sair',
    ru: 'Выйти',
    zh: '登出',
    ja: 'ログアウト'
  },
  'nav.ecosystem': {
    fr: 'Écosystème',
    en: 'Ecosystem',
    es: 'Ecosistema',
    de: 'Ökosystem',
    it: 'Ecosistema',
    pt: 'Ecossistema',
    ru: 'Экосистема',
    zh: '生态系统',
    ja: 'エコシステム'
  },
  'app.translate': {
    fr: 'Traduire',
    en: 'Translate',
    es: 'Traducir',
    de: 'Übersetzen',
    it: 'Traduci',
    pt: 'Traduzir',
    ru: 'Перевести',
    zh: '翻译',
    ja: '翻訳'
  },
  'app.mindmap': {
    fr: 'Carte mentale',
    en: 'Mind Map',
    es: 'Mapa mental',
    de: 'Mindmap',
    it: 'Mappa mentale',
    pt: 'Mapa mental',
    ru: 'Ментальная карта',
    zh: '思维导图',
    ja: 'マインドマップ'
  },
  'app.weather': {
    fr: 'Météo',
    en: 'Weather',
    es: 'Clima',
    de: 'Wetter',
    it: 'Meteo',
    pt: 'Clima',
    ru: 'Погода',
    zh: '天气',
    ja: '天気'
  },
  'app.news': {
    fr: 'Actualités',
    en: 'News',
    es: 'Noticias',
    de: 'Nachrichten',
    it: 'Notizie',
    pt: 'Notícias',
    ru: 'Новости',
    zh: '新闻',
    ja: 'ニュース'
  },
  'app.aiStudio': {
    fr: 'AI Studio',
    en: 'AI Studio',
    es: 'AI Studio',
    de: 'AI Studio',
    it: 'AI Studio',
    pt: 'AI Studio',
    ru: 'AI Studio',
    zh: 'AI Studio',
    ja: 'AI Studio'
  },
  'app.cloud': {
    fr: 'Cloud',
    en: 'Cloud',
    es: 'Cloud',
    de: 'Cloud',
    it: 'Cloud',
    pt: 'Cloud',
    ru: 'Cloud',
    zh: 'Cloud',
    ja: 'Cloud'
  },
  'app.forms': {
    fr: 'Formulaires',
    en: 'Forms',
    es: 'Formularios',
    de: 'Formulare',
    it: 'Moduli',
    pt: 'Formulários',
    ru: 'Формы',
    zh: '表单',
    ja: 'フォーム'
  },
  'footer.description': {
    fr: 'La plateforme technologique qui révolutionne votre façon de travailler.',
    en: 'The technology platform that revolutionizes the way you work.',
    es: 'La plataforma tecnológica que revoluciona tu forma de trabajar.',
    de: 'Die Technologieplattform, die Ihre Arbeitsweise revolutioniert.',
    it: 'La piattaforma tecnologica che rivoluziona il tuo modo di lavorare.',
    pt: 'A plataforma tecnológica que revoluciona sua forma de trabalhar.',
    ru: 'Технологическая платформа, которая революционизирует ваш способ работы.',
    zh: '革命性改变您工作方式的技术平台。',
    ja: 'あなたの働き方を革命的に変える技術プラットフォーム。'
  },
  'footer.products': {
    fr: 'Produits',
    en: 'Products',
    es: 'Productos',
    de: 'Produkte',
    it: 'Prodotti',
    pt: 'Produtos',
    ru: 'Продукты',
    zh: '产品',
    ja: '製品'
  },
  'footer.resources': {
    fr: 'Ressources',
    en: 'Resources',
    es: 'Recursos',
    de: 'Ressourcen',
    it: 'Risorse',
    pt: 'Recursos',
    ru: 'Ресурсы',
    zh: '资源',
    ja: 'リソース'
  },
  'footer.legal': {
    fr: 'Légal',
    en: 'Legal',
    es: 'Legal',
    de: 'Rechtliches',
    it: 'Legale',
    pt: 'Legal',
    ru: 'Правовая информация',
    zh: '法律',
    ja: '法的事項'
  },
  'footer.documentation': {
    fr: 'Documentation',
    en: 'Documentation',
    es: 'Documentación',
    de: 'Dokumentation',
    it: 'Documentazione',
    pt: 'Documentação',
    ru: 'Документация',
    zh: '文档',
    ja: 'ドキュメント'
  },
  'footer.api': {
    fr: 'API',
    en: 'API',
    es: 'API',
    de: 'API',
    it: 'API',
    pt: 'API',
    ru: 'API',
    zh: 'API',
    ja: 'API'
  },
  'footer.privacy': {
    fr: 'Confidentialité',
    en: 'Privacy',
    es: 'Privacidad',
    de: 'Datenschutz',
    it: 'Privacy',
    pt: 'Privacidade',
    ru: 'Конфиденциальность',
    zh: '隐私',
    ja: 'プライバシー'
  },
  'footer.terms': {
    fr: 'Conditions',
    en: 'Terms',
    es: 'Términos',
    de: 'Bedingungen',
    it: 'Termini',
    pt: 'Termos',
    ru: 'Условия',
    zh: '条款',
    ja: '利用規約'
  },
  'footer.cookies': {
    fr: 'Cookies',
    en: 'Cookies',
    es: 'Cookies',
    de: 'Cookies',
    it: 'Cookies',
    pt: 'Cookies',
    ru: 'Cookies',
    zh: 'Cookies',
    ja: 'Cookies'
  },
  'footer.copyright': {
    fr: '© 2024 LuvviX Technologies. Tous droits réservés.',
    en: '© 2024 LuvviX Technologies. All rights reserved.',
    es: '© 2024 LuvviX Technologies. Todos los derechos reservados.',
    de: '© 2024 LuvviX Technologies. Alle Rechte vorbehalten.',
    it: '© 2024 LuvviX Technologies. Tutti i diritti riservati.',
    pt: '© 2024 LuvviX Technologies. Todos os direitos reservados.',
    ru: '© 2024 LuvviX Technologies. Все права защищены.',
    zh: '© 2024 LuvviX Technologies. 版权所有。',
    ja: '© 2024 LuvviX Technologies. 全著作権所有。'
  },
  'footer.availableLanguages': {
    fr: 'Langues disponibles',
    en: 'Available languages',
    es: 'Idiomas disponibles',
    de: 'Verfügbare Sprachen',
    it: 'Lingue disponibili',
    pt: 'Idiomas disponíveis',
    ru: 'Доступные языки',
    zh: '可用语言',
    ja: '利用可能な言語'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
