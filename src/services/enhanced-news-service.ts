
import { NewsItem } from '@/types/news';

// Sources RSS multilingues étendues
const RSS_SOURCES = {
  fr: {
    general: [
      'https://www.lemonde.fr/rss/une.xml',
      'https://www.lefigaro.fr/rss/figaro_actualites.xml',
      'https://www.liberation.fr/arc/outboundfeeds/rss-all/',
      'https://feeds.francetvinfo.fr/franceinfo/une.xml',
      'https://rmc.bfmtv.com/rss/info/'
    ],
    technology: [
      'https://www.01net.com/rss/info/flux-rss/flux-nouveautes.xml',
      'https://www.numerama.com/feed/',
      'https://feeds.feedburner.com/francetvinfo/sciences-tech'
    ],
    business: [
      'https://www.lesechos.fr/rss/tout-lesechos.xml',
      'https://feeds.feedburner.com/laTribune'
    ],
    sports: [
      'https://www.lequipe.fr/rss/actu_rss.xml',
      'https://rmcsport.bfmtv.com/rss/'
    ],
    entertainment: [
      'https://www.allocine.fr/rss/actualites.xml',
      'https://feeds.purepeople.com/v2/latest'
    ]
  },
  en: {
    general: [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://rss.cnn.com/rss/edition.rss',
      'https://feeds.reuters.com/reuters/topNews'
    ],
    technology: [
      'https://feeds.feedburner.com/TechCrunch',
      'https://www.wired.com/feed/rss',
      'https://feeds.arstechnica.com/arstechnica/index'
    ],
    business: [
      'https://feeds.bloomberg.com/markets/news.rss',
      'https://feeds.feedburner.com/wsj/xml/rss/3_7085.xml'
    ],
    sports: [
      'https://feeds.skysports.com/feeds/11095',
      'https://feeds.espn.com/espn/rss/news'
    ]
  },
  es: {
    general: [
      'https://ep01.epimg.net/rss/elpais/portada.xml',
      'https://www.abc.es/rss/feeds/abc_EspanaEspana.xml'
    ],
    technology: [
      'https://www.xataka.com/index.xml'
    ]
  },
  de: {
    general: [
      'https://www.spiegel.de/schlagzeilen/tops/index.rss',
      'https://www.zeit.de/news/index'
    ],
    technology: [
      'https://www.heise.de/rss/heise-atom.xml'
    ]
  },
  it: {
    general: [
      'https://www.corriere.it/rss/homepage.xml',
      'https://www.repubblica.it/rss/homepage/rss2.0.xml'
    ]
  },
  ru: {
    general: [
      'https://lenta.ru/rss',
      'https://ria.ru/export/rss2/archive/index.xml'
    ]
  }
};

export const fetchEnhancedNews = async (
  categories: string[],
  language: string = 'fr',
  country: string = ''
): Promise<NewsItem[]> => {
  const allNews: NewsItem[] = [];
  
  try {
    // Si aucune catégorie n'est sélectionnée, utiliser les actualités générales
    const targetCategories = categories.length > 0 ? categories : ['general'];
    
    for (const category of targetCategories) {
      // Utiliser l'edge function get-news pour récupérer les actualités
      const { data, error } = await fetch('/api/get-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          country: getCountryFromLanguage(language),
          language
        })
      }).then(res => res.json());

      if (!error && data?.items) {
        // Traiter chaque article avec l'IA
        const processedArticles = await Promise.all(
          data.items.slice(0, 5).map(async (item: any) => {
            const aiSummary = await generateAISummary(item, language);
            const aiTags = generateSmartTags(item, language);
            const relevanceScore = calculateRelevanceScore(item, categories);

            return {
              ...item,
              aiSummary,
              aiTags,
              relevanceScore,
              category,
              language
            };
          })
        );

        allNews.push(...processedArticles);
      }
    }

    // Trier par score de pertinence et récence
    return allNews
      .sort((a, b) => {
        const scoreA = (a.relevanceScore || 0) + getRecencyScore(a.publishedAt);
        const scoreB = (b.relevanceScore || 0) + getRecencyScore(b.publishedAt);
        return scoreB - scoreA;
      })
      .slice(0, 15); // Limiter à 15 articles
      
  } catch (error) {
    console.error('Error fetching enhanced news:', error);
    return getFallbackNews(language);
  }
};

const generateAISummary = async (item: any, language: string): Promise<string> => {
  // Simuler un résumé IA adapté à la langue
  const summaryTemplates = {
    fr: [
      `📰 Résumé IA: ${item.title.substring(0, 80)}...`,
      `🔍 L'IA analyse: Cette actualité importante traite de ${extractKeywords(item.title, 'fr')[0] || 'sujets d\'actualité'}`,
      `⚡ Synthèse: ${item.summary?.substring(0, 100) || 'Information traitée par l\'IA'}...`
    ],
    en: [
      `📰 AI Summary: ${item.title.substring(0, 80)}...`,
      `🔍 AI Analysis: This important news covers ${extractKeywords(item.title, 'en')[0] || 'current topics'}`,
      `⚡ Synthesis: ${item.summary?.substring(0, 100) || 'Information processed by AI'}...`
    ],
    es: [
      `📰 Resumen IA: ${item.title.substring(0, 80)}...`,
      `🔍 Análisis IA: Esta noticia importante cubre ${extractKeywords(item.title, 'es')[0] || 'temas actuales'}`,
      `⚡ Síntesis: ${item.summary?.substring(0, 100) || 'Información procesada por IA'}...`
    ]
  };

  const templates = summaryTemplates[language as keyof typeof summaryTemplates] || summaryTemplates.fr;
  return templates[Math.floor(Math.random() * templates.length)];
};

const generateSmartTags = (item: any, language: string): string[] => {
  const tagsByLanguage = {
    fr: ['🔥 Tendance', '⚡ Flash', '🎯 Recommandé', '📈 Important', '🌟 Sélectionné', '🚀 Nouveau'],
    en: ['🔥 Trending', '⚡ Flash', '🎯 Recommended', '📈 Important', '🌟 Selected', '🚀 New'],
    es: ['🔥 Tendencia', '⚡ Flash', '🎯 Recomendado', '📈 Importante', '🌟 Seleccionado', '🚀 Nuevo'],
    de: ['🔥 Trend', '⚡ Flash', '🎯 Empfohlen', '📈 Wichtig', '🌟 Ausgewählt', '🚀 Neu'],
    it: ['🔥 Tendenza', '⚡ Flash', '🎯 Consigliato', '📈 Importante', '🌟 Selezionato', '🚀 Nuovo'],
    ru: ['🔥 Тренд', '⚡ Флэш', '🎯 Рекомендуем', '📈 Важно', '🌟 Выбрано', '🚀 Новое']
  };

  const tags = tagsByLanguage[language as keyof typeof tagsByLanguage] || tagsByLanguage.fr;
  return tags.slice(0, Math.floor(Math.random() * 2) + 1);
};

const calculateRelevanceScore = (item: any, categories: string[]): number => {
  let score = 70;
  
  // Bonus pour les catégories sélectionnées
  if (categories.includes(item.category)) {
    score += 20;
  }
  
  // Bonus pour la récence
  const hoursOld = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursOld < 2) score += 15;
  else if (hoursOld < 6) score += 10;
  else if (hoursOld < 12) score += 5;
  
  return Math.min(95, score);
};

const getRecencyScore = (publishedAt: string): number => {
  const hoursOld = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
  return Math.max(0, 10 - hoursOld);
};

const extractKeywords = (text: string, language: string): string[] => {
  // Mots-clés simples basés sur la langue
  const commonWords = {
    fr: ['politique', 'économie', 'technologie', 'sport', 'culture', 'santé', 'environnement'],
    en: ['politics', 'economy', 'technology', 'sports', 'culture', 'health', 'environment'],
    es: ['política', 'economía', 'tecnología', 'deportes', 'cultura', 'salud', 'medio ambiente']
  };

  const words = commonWords[language as keyof typeof commonWords] || commonWords.fr;
  return words.filter(word => text.toLowerCase().includes(word.toLowerCase()));
};

const getCountryFromLanguage = (language: string): string => {
  const countryMap = {
    fr: 'fr',
    en: 'us',
    es: 'es',
    de: 'de',
    it: 'it',
    ru: 'ru'
  };
  return countryMap[language as keyof typeof countryMap] || 'fr';
};

const getFallbackNews = (language: string): NewsItem[] => {
  const fallbackTitles = {
    fr: 'Actualités disponibles - Configurez vos préférences',
    en: 'News available - Configure your preferences',
    es: 'Noticias disponibles - Configura tus preferencias'
  };

  return [{
    id: 'fallback-1',
    title: fallbackTitles[language as keyof typeof fallbackTitles] || fallbackTitles.fr,
    summary: 'Personnalisez votre fil d\'actualités selon vos intérêts.',
    content: 'Configurez vos préférences pour une expérience personnalisée.',
    publishedAt: new Date().toISOString(),
    source: 'LuvviX News',
    category: 'general',
    url: '#',
    language
  }];
};
