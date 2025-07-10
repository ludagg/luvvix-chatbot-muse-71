
import { supabase } from '@/integrations/supabase/client';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIChatConversation {
  id: string;
  title: string;
  messages: AIChatMessage[];
  created_at: string;
  updated_at: string;
}

class AIChatService {
  // Suggestions de réponse IA
  async suggestReply(conversationId: string): Promise<{ text: string; confidence: number }[]> {
    // Simulation de suggestions IA
    return [
      { text: "C'est une excellente idée !", confidence: 0.9 },
      { text: "Peux-tu m'en dire plus ?", confidence: 0.8 },
      { text: "Je comprends ton point de vue.", confidence: 0.7 }
    ];
  }

  // Traduction de message
  async translateMessage(text: string, targetLang: string): Promise<string> {
    // Simulation de traduction (en production, utiliser un service de traduction)
    const translations: { [key: string]: string } = {
      'en': `[EN] ${text}`,
      'es': `[ES] ${text}`,
      'de': `[DE] ${text}`,
      'it': `[IT] ${text}`
    };
    
    return translations[targetLang] || text;
  }

  // Amélioration de message
  async enhanceMessage(text: string, style: 'formal' | 'casual' | 'emoji' | 'correct'): Promise<string> {
    switch (style) {
      case 'formal':
        return `Je vous prie de bien vouloir noter que ${text.toLowerCase()}`;
      case 'casual':
        return `Hey ! ${text} 😊`;
      case 'emoji':
        return `${text} ✨😊👍`;
      case 'correct':
        return text.replace(/\b\w+\b/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      default:
        return text;
    }
  }

  // Résumé automatique de conversation
  async summarizeConversation(messages: AIChatMessage[]): Promise<string> {
    if (messages.length === 0) return "Aucun message";
    if (messages.length === 1) return messages[0].content.substring(0, 50) + "...";
    
    return `Conversation avec ${messages.length} messages. Dernier: ${messages[messages.length - 1].content.substring(0, 30)}...`;
  }

  // Détection de sentiment
  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; confidence: number }> {
    // Simulation simple de détection de sentiment
    const positiveWords = ['super', 'génial', 'excellent', 'parfait', 'merci', '😊', '👍', '❤️'];
    const negativeWords = ['problème', 'erreur', 'bug', 'cassé', 'nul', '😞', '👎', '❌'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', confidence: 0.8 };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', confidence: 0.8 };
    } else {
      return { sentiment: 'neutral', confidence: 0.6 };
    }
  }

  // Suggestions de réponse rapide
  async getQuickReplies(context: string): Promise<string[]> {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('salut') || contextLower.includes('bonjour')) {
      return ['Salut ! 👋', 'Bonjour ! Comment ça va ?', 'Hey ! Quoi de neuf ?'];
    }
    
    if (contextLower.includes('merci')) {
      return ['De rien ! 😊', 'Avec plaisir !', 'Pas de souci !'];
    }
    
    if (contextLower.includes('comment') || contextLower.includes('?')) {
      return ['Bonne question !', 'Laisse-moi réfléchir...', 'Peux-tu préciser ?'];
    }
    
    return ['👍', '😊', 'Intéressant !', 'Je vois', 'D\'accord'];
  }

  // Correction automatique
  async autoCorrect(text: string): Promise<string> {
    // Corrections simples
    const corrections: { [key: string]: string } = {
      'sa va': 'ça va',
      'est ce que': 'est-ce que',
      'avc': 'avec',
      'pr': 'pour',
      'ds': 'dans',
      'ts': 'tous',
      'tj': 'toujours',
      'pk': 'pourquoi',
      'qd': 'quand',
      'qq': 'quelque',
      'qqn': 'quelqu\'un',
      'qqch': 'quelque chose'
    };
    
    let corrected = text;
    Object.entries(corrections).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    });
    
    return corrected;
  }

  // Génération de titre automatique
  async generateTitle(firstMessage: string): Promise<string> {
    const words = firstMessage.split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  }
}

export const aiChatService = new AIChatService();
