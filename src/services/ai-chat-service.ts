
import { supabase } from '@/integrations/supabase/client';

export interface AITranslation {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export interface AISummary {
  conversation_id: string;
  summary: string;
  period: string;
  created_at: string;
}

export interface AIReplySubestion {
  text: string;
  tone: 'casual' | 'formal' | 'friendly' | 'professional';
  confidence: number;
}

class AIChatService {
  async translateMessage(text: string, targetLang: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-translate', {
        body: {
          text,
          target_language: targetLang
        }
      });

      if (error) throw error;
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  async generateConversationSummary(conversationId: string, messageCount: number = 50): Promise<string> {
    try {
      // Récupérer les derniers messages
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          content,
          message_type,
          sent_at,
          user_profiles!chat_messages_sender_id_fkey(full_name)
        `)
        .eq('conversation_id', conversationId)
        .eq('message_type', 'text')
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false })
        .limit(messageCount);

      if (error || !messages || messages.length === 0) {
        return 'Aucun message à résumer';
      }

      // Préparer le texte pour le résumé
      const conversationText = messages
        .reverse()
        .map(msg => {
          const userName = msg.user_profiles && Array.isArray(msg.user_profiles) 
            ? msg.user_profiles[0]?.full_name 
            : msg.user_profiles?.full_name || 'Utilisateur';
          return `${userName}: ${msg.content}`;
        })
        .join('\n');

      const { data, error: summaryError } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message: `Résume cette conversation de manière concise et utile:\n\n${conversationText}`,
          context: 'Tu es un assistant qui résume les conversations de chat. Fournis un résumé bref et pertinent.'
        }
      });

      if (summaryError) throw summaryError;
      return data.response || 'Impossible de générer un résumé';
    } catch (error) {
      console.error('Summary error:', error);
      return 'Erreur lors de la génération du résumé';
    }
  }

  async suggestReply(conversationId: string, messageCount: number = 10): Promise<AIReplySubestion[]> {
    try {
      // Récupérer les derniers messages
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          content,
          message_type,
          sent_at,
          user_profiles!chat_messages_sender_id_fkey(full_name)
        `)
        .eq('conversation_id', conversationId)
        .eq('message_type', 'text')
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false })
        .limit(messageCount);

      if (error || !messages || messages.length === 0) {
        return [];
      }

      const conversationText = messages
        .reverse()
        .map(msg => {
          const userName = msg.user_profiles && Array.isArray(msg.user_profiles) 
            ? msg.user_profiles[0]?.full_name 
            : msg.user_profiles?.full_name || 'Utilisateur';
          return `${userName}: ${msg.content}`;
        })
        .join('\n');

      const { data, error: suggestionError } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message: `Basé sur cette conversation, suggère 3 réponses courtes et appropriées (une décontractée, une formelle, une amicale):\n\n${conversationText}`,
          context: 'Tu es un assistant qui suggère des réponses contextuelles. Fournis 3 suggestions courtes séparées par des tirets.'
        }
      });

      if (suggestionError) throw suggestionError;

      // Parser les suggestions
      const suggestions = data.response?.split('-').filter((s: string) => s.trim()) || [];
      
      return suggestions.slice(0, 3).map((text: string, index: number) => ({
        text: text.trim(),
        tone: ['casual', 'formal', 'friendly'][index] as AIReplySubestion['tone'],
        confidence: 0.8
      }));
    } catch (error) {
      console.error('Reply suggestion error:', error);
      return [];
    }
  }

  async detectLanguage(text: string): Promise<string> {
    // Simple détection de langue basée sur des patterns
    const frenchWords = ['le', 'la', 'les', 'de', 'du', 'et', 'à', 'un', 'une', 'pour', 'que', 'qui'];
    const englishWords = ['the', 'of', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was'];
    
    const words = text.toLowerCase().split(/\s+/);
    let frenchScore = 0;
    let englishScore = 0;

    words.forEach(word => {
      if (frenchWords.includes(word)) frenchScore++;
      if (englishWords.includes(word)) englishScore++;
    });

    if (frenchScore > englishScore) return 'fr';
    if (englishScore > frenchScore) return 'en';
    return 'auto';
  }

  async enhanceMessage(text: string, enhancement: 'formal' | 'casual' | 'emoji' | 'correct'): Promise<string> {
    try {
      let prompt = '';
      
      switch (enhancement) {
        case 'formal':
          prompt = `Réécris ce message de manière plus formelle et professionnelle: "${text}"`;
          break;
        case 'casual':
          prompt = `Réécris ce message de manière plus décontractée et amicale: "${text}"`;
          break;
        case 'emoji':
          prompt = `Ajoute des emojis appropriés à ce message: "${text}"`;
          break;
        case 'correct':
          prompt = `Corrige les fautes d'orthographe et de grammaire dans ce message: "${text}"`;
          break;
      }

      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message: prompt,
          context: 'Tu es un assistant qui améliore les messages. Réponds uniquement avec le message amélioré, sans explication.'
        }
      });

      if (error) throw error;
      return data.response || text;
    } catch (error) {
      console.error('Message enhancement error:', error);
      return text;
    }
  }
}

export const aiChatService = new AIChatService();
