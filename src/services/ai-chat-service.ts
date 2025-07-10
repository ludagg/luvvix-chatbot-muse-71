
import { supabase } from '@/integrations/supabase/client';

interface AISuggestion {
  text: string;
  confidence: number;
  type: 'reply' | 'question' | 'action';
}

interface TranslationResult {
  text: string;
  from: string;
  to: string;
  confidence: number;
}

class AIChatService {
  // Suggestions de réponses basées sur l'IA
  async suggestReply(conversationId: string): Promise<AISuggestion[]> {
    try {
      // Récupérer les derniers messages de la conversation
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('content, message_type')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (!messages || messages.length === 0) {
        return this.getDefaultSuggestions();
      }

      // Analyser le contexte pour générer des suggestions
      const lastMessage = messages[0];
      return this.generateContextualSuggestions(lastMessage.content);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return this.getDefaultSuggestions();
    }
  }

  // Traduction de messages
  async translateMessage(text: string, targetLanguage: string): Promise<string> {
    try {
      // Simulation de traduction (en production, utiliser une vraie API de traduction)
      const translations: { [key: string]: { [key: string]: string } } = {
        'en': {
          'Bonjour': 'Hello',
          'Comment allez-vous?': 'How are you?',
          'Merci': 'Thank you',
          'Au revoir': 'Goodbye'
        },
        'es': {
          'Bonjour': 'Hola',
          'Comment allez-vous?': '¿Cómo estás?',
          'Merci': 'Gracias',
          'Au revoir': 'Adiós'
        }
      };

      const languageTranslations = translations[targetLanguage];
      if (languageTranslations && languageTranslations[text]) {
        return languageTranslations[text];
      }

      return `[Traduit en ${targetLanguage}] ${text}`;
    } catch (error) {
      console.error('Error translating message:', error);
      return text;
    }
  }

  // Amélioration de messages
  async enhanceMessage(message: string, enhancement: 'formal' | 'casual' | 'emoji' | 'correct'): Promise<string> {
    try {
      switch (enhancement) {
        case 'formal':
          return this.makeFormal(message);
        case 'casual':
          return this.makeCasual(message);
        case 'emoji':
          return this.addEmojis(message);
        case 'correct':
          return this.correctMessage(message);
        default:
          return message;
      }
    } catch (error) {
      console.error('Error enhancing message:', error);
      return message;
    }
  }

  // Génération de suggestions contextuelles
  private generateContextualSuggestions(lastMessage: string): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    if (lastMessage?.toLowerCase().includes('bonjour') || lastMessage?.toLowerCase().includes('salut')) {
      suggestions.push({
        text: "Bonjour ! Comment allez-vous ?",
        confidence: 0.9,
        type: 'reply'
      });
    }
    
    if (lastMessage?.toLowerCase().includes('merci')) {
      suggestions.push({
        text: "De rien, c'est avec plaisir !",
        confidence: 0.8,
        type: 'reply'
      });
    }
    
    if (lastMessage?.includes('?')) {
      suggestions.push({
        text: "Bonne question ! Laissez-moi y réfléchir.",
        confidence: 0.7,
        type: 'reply'
      });
    }

    // Ajouter des suggestions génériques si pas assez spécifiques
    if (suggestions.length < 3) {
      suggestions.push(...this.getDefaultSuggestions().slice(0, 3 - suggestions.length));
    }

    return suggestions;
  }

  // Suggestions par défaut
  private getDefaultSuggestions(): AISuggestion[] {
    return [
      {
        text: "D'accord !",
        confidence: 0.8,
        type: 'reply'
      },
      {
        text: "Merci pour l'information",
        confidence: 0.7,
        type: 'reply'
      },
      {
        text: "Pouvez-vous m'en dire plus ?",
        confidence: 0.6,
        type: 'question'
      }
    ];
  }

  // Rendre un message plus formel
  private makeFormal(message: string): string {
    return message
      .replace(/salut/gi, 'Bonjour')
      .replace(/ok/gi, 'D\'accord')
      .replace(/ouais/gi, 'Oui')
      .replace(/non/gi, 'Non, merci');
  }

  // Rendre un message plus décontracté
  private makeCasual(message: string): string {
    return message
      .replace(/Bonjour/gi, 'Salut')
      .replace(/D\'accord/gi, 'OK')
      .replace(/Oui/gi, 'Ouais');
  }

  // Ajouter des emojis
  private addEmojis(message: string): string {
    return message
      .replace(/bonjour/gi, 'Bonjour 👋')
      .replace(/merci/gi, 'Merci 🙏')
      .replace(/super/gi, 'Super 🎉')
      .replace(/génial/gi, 'Génial 🚀');
  }

  // Corriger un message (simulation)
  private correctMessage(message: string): string {
    return message
      .replace(/sa va/gi, 'ça va')
      .replace(/ct/gi, 'c\'était')
      .replace(/pr/gi, 'pour');
  }
}

export const aiChatService = new AIChatService();
