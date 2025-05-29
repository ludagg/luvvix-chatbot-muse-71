
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en' | 'es' | 'pt' | 'de' | 'zh' | 'ru' | 'it' | 'ar';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; flag: string }[];
}

const translations: Translations = {
  // Navigation
  'nav.applications': {
    fr: 'Applications',
    en: 'Applications', 
    es: 'Aplicaciones',
    pt: 'Aplicações',
    de: 'Anwendungen',
    zh: '应用程序',
    ru: 'Приложения',
    it: 'Applicazioni',
    ar: 'التطبيقات'
  },
  'nav.ecosystem': {
    fr: 'Écosystème',
    en: 'Ecosystem',
    es: 'Ecosistema', 
    pt: 'Ecossistema',
    de: 'Ökosystem',
    zh: '生态系统',
    ru: 'Экосистема',
    it: 'Ecosistema',
    ar: 'النظام البيئي'
  },
  'nav.news': {
    fr: 'Actualités',
    en: 'News',
    es: 'Noticias',
    pt: 'Notícias', 
    de: 'Nachrichten',
    zh: '新闻',
    ru: 'Новости',
    it: 'Notizie',
    ar: 'الأخبار'
  },
  'nav.signin': {
    fr: 'Se connecter',
    en: 'Sign In',
    es: 'Iniciar Sesión',
    pt: 'Entrar',
    de: 'Anmelden',
    zh: '登录',
    ru: 'Войти',
    it: 'Accedi',
    ar: 'تسجيل الدخول'
  },
  // Dashboard
  'dashboard.title': {
    fr: 'Tableau de bord',
    en: 'Dashboard',
    es: 'Panel de Control',
    pt: 'Painel',
    de: 'Dashboard',
    zh: '仪表板',
    ru: 'Панель управления',
    it: 'Pannello di controllo',
    ar: 'لوحة التحكم'
  },
  'dashboard.welcome': {
    fr: 'Bienvenue',
    en: 'Welcome',
    es: 'Bienvenido',
    pt: 'Bem-vindo',
    de: 'Willkommen',
    zh: '欢迎',
    ru: 'Добро пожаловать',
    it: 'Benvenuto',
    ar: 'مرحباً'
  },
  'dashboard.ecosystem': {
    fr: 'LuvviX',
    en: 'LuvviX',
    es: 'LuvviX',
    pt: 'LuvviX',
    de: 'LuvviX',
    zh: 'LuvviX',
    ru: 'LuvviX',
    it: 'LuvviX',
    ar: 'LuvviX'
  },
  'dashboard.connectedApps': {
    fr: 'Applications connectées',
    en: 'Connected Apps',
    es: 'Aplicaciones Conectadas',
    pt: 'Aplicações Conectadas',
    de: 'Verbundene Apps',
    zh: '已连接的应用',
    ru: 'Подключенные приложения',
    it: 'App Connesse',
    ar: 'التطبيقات المتصلة'
  },
  'dashboard.security': {
    fr: 'Sécurité',
    en: 'Security',
    es: 'Seguridad',
    pt: 'Segurança',
    de: 'Sicherheit',
    zh: '安全',
    ru: 'Безопасность',
    it: 'Sicurezza',
    ar: 'الأمان'
  },
  'dashboard.profile': {
    fr: 'Profil',
    en: 'Profile',
    es: 'Perfil',
    pt: 'Perfil',
    de: 'Profil',
    zh: '个人资料',
    ru: 'Профиль',
    it: 'Profilo',
    ar: 'الملف الشخصي'
  },
  'settings.language': {
    fr: 'Langue',
    en: 'Language',
    es: 'Idioma',
    pt: 'Idioma',
    de: 'Sprache',
    zh: '语言',
    ru: 'Язык',
    it: 'Lingua',
    ar: 'اللغة'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages = [
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' }
];

const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('ar')) return 'ar';
  
  return 'fr'; // Default to French
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('luvvix-language') as Language;
    return saved || detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('luvvix-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.fr || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
