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
  'explore.title': {
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
  'explore.subtitle': {
    fr: 'Recherche IA multimodale avancée',
    en: 'Advanced multimodal AI search',
    es: 'Búsqueda IA multimodal avanzada',
    de: 'Erweiterte multimodale KI-Suche',
    it: 'Ricerca IA multimodale avanzata',
    pt: 'Pesquisa IA multimodal avançada',
    ru: 'Расширенный мультимодальный поиск ИИ',
    zh: '高级多模态AI搜索',
    ja: '高度なマルチモーダルAI検索'
  },
  'explore.description': {
    fr: 'Recherchez sur le web, dans vos fichiers, et plus encore avec l\'intelligence artificielle. Obtenez des résumés instantanés et des insights intelligents.',
    en: 'Search the web, your files, and more with artificial intelligence. Get instant summaries and smart insights.',
    es: 'Busca en la web, tus archivos y más con inteligencia artificial. Obtén resúmenes instantáneos e insights inteligentes.',
    de: 'Durchsuchen Sie das Web, Ihre Dateien und mehr mit künstlicher Intelligenz. Erhalten Sie sofortige Zusammenfassungen und intelligente Erkenntnisse.',
    it: 'Cerca nel web, nei tuoi file e altro con intelligenza artificiale. Ottieni riassunti istantanei e insights intelligenti.',
    pt: 'Pesquise na web, seus arquivos e mais com inteligência artificial. Obtenha resumos instantâneos e insights inteligentes.',
    ru: 'Ищите в интернете, ваших файлах и многом другом с помощью искусственного интеллекта. Получайте мгновенные резюме и умные выводы.',
    zh: '使用人工智能搜索网络、您的文件等。获得即时摘要和智能见解。',
    ja: '人工知能でウェブ、ファイルなどを検索。瞬時の要約とスマートな洞察を取得。'
  },
  'explore.search_placeholder': {
    fr: 'Recherchez n\'importe quoi...',
    en: 'Search anything...',
    es: 'Buscar cualquier cosa...',
    de: 'Alles suchen...',
    it: 'Cerca qualsiasi cosa...',
    pt: 'Pesquisar qualquer coisa...',
    ru: 'Найти что угодно...',
    zh: '搜索任何内容...',
    ja: '何でも検索...'
  },
  'explore.search_btn': {
    fr: 'Rechercher',
    en: 'Search',
    es: 'Buscar',
    de: 'Suchen',
    it: 'Cerca',
    pt: 'Pesquisar',
    ru: 'Поиск',
    zh: '搜索',
    ja: '検索'
  },
  'explore.upload_file': {
    fr: 'Télécharger un fichier',
    en: 'Upload file',
    es: 'Subir archivo',
    de: 'Datei hochladen',
    it: 'Carica file',
    pt: 'Enviar arquivo',
    ru: 'Загрузить файл',
    zh: '上传文件',
    ja: 'ファイルをアップロード'
  },
  'explore.categories.web': {
    fr: 'Web',
    en: 'Web',
    es: 'Web',
    de: 'Web',
    it: 'Web',
    pt: 'Web',
    ru: 'Веб',
    zh: '网络',
    ja: 'ウェブ'
  },
  'explore.categories.videos': {
    fr: 'Vidéos',
    en: 'Videos',
    es: 'Videos',
    de: 'Videos',
    it: 'Video',
    pt: 'Vídeos',
    ru: 'Видео',
    zh: '视频',
    ja: '動画'
  },
  'explore.categories.images': {
    fr: 'Images',
    en: 'Images',
    es: 'Imágenes',
    de: 'Bilder',
    it: 'Immagini',
    pt: 'Imagens',
    ru: 'Изображения',
    zh: '图片',
    ja: '画像'
  },
  'explore.categories.files': {
    fr: 'Fichiers',
    en: 'Files',
    es: 'Archivos',
    de: 'Dateien',
    it: 'File',
    pt: 'Arquivos',
    ru: 'Файлы',
    zh: '文件',
    ja: 'ファイル'
  },
  'explore.categories.discussions': {
    fr: 'Discussions',
    en: 'Discussions',
    es: 'Discusiones',
    de: 'Diskussionen',
    it: 'Discussioni',
    pt: 'Discussões',
    ru: 'Обсуждения',
    zh: '讨论',
    ja: 'ディスカッション'
  },
  'explore.results_found': {
    fr: 'résultats trouvés',
    en: 'results found',
    es: 'resultados encontrados',
    de: 'Ergebnisse gefunden',
    it: 'risultati trovati',
    pt: 'resultados encontrados',
    ru: 'результатов найдено',
    zh: '找到结果',
    ja: '件の結果が見つかりました'
  },
  'explore.no_results': {
    fr: 'Aucun résultat trouvé',
    en: 'No results found',
    es: 'No se encontraron resultados',
    de: 'Keine Ergebnisse gefunden',
    it: 'Nessun risultato trovato',
    pt: 'Nenhum resultado encontrado',
    ru: 'Результатов не найдено',
    zh: '未找到结果',
    ja: '結果が見つかりませんでした'
  },
  'explore.loading': {
    fr: 'Recherche en cours...',
    en: 'Searching...',
    es: 'Buscando...',
    de: 'Suche läuft...',
    it: 'Ricerca in corso...',
    pt: 'Pesquisando...',
    ru: 'Поиск...',
    zh: '搜索中...',
    ja: '検索中...'
  },
  'explore.recent_searches': {
    fr: 'Recherches récentes',
    en: 'Recent searches',
    es: 'Búsquedas recientes',
    de: 'Letzte Suchen',
    it: 'Ricerche recenti',
    pt: 'Pesquisas recentes',
    ru: 'Недавние поиски',
    zh: '最近搜索',
    ja: '最近の検索'
  },
  'explore.suggested_searches': {
    fr: 'Recherches suggérées',
    en: 'Suggested searches',
    es: 'Búsquedas sugeridas',
    de: 'Vorgeschlagene Suchen',
    it: 'Ricerche suggerite',
    pt: 'Pesquisas sugeridas',
    ru: 'Предложенные поиски',
    zh: '建议搜索',
    ja: '検索候補'
  },
  'explore.ai_summary': {
    fr: 'Résumé IA',
    en: 'AI Summary',
    es: 'Resumen IA',
    de: 'KI-Zusammenfassung',
    it: 'Riassunto IA',
    pt: 'Resumo IA',
    ru: 'ИИ Резюме',
    zh: 'AI摘要',
    ja: 'AI要約'
  },
  'explore.share_result': {
    fr: 'Partager',
    en: 'Share',
    es: 'Compartir',
    de: 'Teilen',
    it: 'Condividi',
    pt: 'Compartilhar',
    ru: 'Поделиться',
    zh: '分享',
    ja: '共有'
  },
  'explore.create_mindmap': {
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
  'explore.translate_result': {
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
  'explore.create_form': {
    fr: 'Créer formulaire',
    en: 'Create Form',
    es: 'Crear formulario',
    de: 'Formular erstellen',
    it: 'Crea modulo',
    pt: 'Criar formulário',
    ru: 'Создать форму',
    zh: '创建表单',
    ja: 'フォーム作成'
  },
  'explore.create_agent': {
    fr: 'Créer agent',
    en: 'Create Agent',
    es: 'Crear agente',
    de: 'Agent erstellen',
    it: 'Crea agente',
    pt: 'Criar agente',
    ru: 'Создать агента',
    zh: '创建代理',
    ja: 'エージェント作成'
  },
  'explore.publish_center': {
    fr: 'Publier au Centre',
    en: 'Publish to Center',
    es: 'Publicar en Centro',
    de: 'Im Center veröffentlichen',
    it: 'Pubblica nel Centro',
    pt: 'Publicar no Centro',
    ru: 'Опубликовать в Центре',
    zh: '发布到中心',
    ja: 'センターに公開'
  },
  'news.categories.all': {
    fr: 'Toutes',
    en: 'All',
    es: 'Todas',
    de: 'Alle',
    it: 'Tutte',
    pt: 'Todas',
    ru: 'Все',
    zh: '全部',
    ja: 'すべて'
  },
  'common.error': {
    fr: 'Une erreur est survenue',
    en: 'An error occurred',
    es: 'Ocurrió un error',
    de: 'Ein Fehler ist aufgetreten',
    it: 'Si è verificato un errore',
    pt: 'Ocorreu um erro',
    ru: 'Произошла ошибка',
    zh: '发生错误',
    ja: 'エラーが発生しました'
  },
  'common.upload': {
    fr: 'Fichier téléchargé',
    en: 'File uploaded',
    es: 'Archivo subido',
    de: 'Datei hochgeladen',
    it: 'File caricato',
    pt: 'Arquivo enviado',
    ru: 'Файл загружен',
    zh: '文件已上传',
    ja: 'ファイルがアップロードされました'
  },
  'common.copy': {
    fr: 'Copié dans le presse-papiers',
    en: 'Copied to clipboard',
    es: 'Copiado al portapapeles',
    de: 'In Zwischenablage kopiert',
    it: 'Copiato negli appunti',
    pt: 'Copiado para área de transferência',
    ru: 'Скопировано в буфер обмена',
    zh: '已复制到剪贴板',
    ja: 'クリップボードにコピーされました'
  },
  'common.filter': {
    fr: 'Filtrer',
    en: 'Filter',
    es: 'Filtrar',
    de: 'Filtern',
    it: 'Filtra',
    pt: 'Filtrar',
    ru: 'Фильтр',
    zh: '过滤',
    ja: 'フィルター'
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
