
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth-utils';

export interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence: number;
  created_at: string;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  supported: boolean;
}

export interface TranslationHistory {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

class TranslateService {
  async getSupportedLanguages(): Promise<Language[]> {
    try {
      const { data, error } = await supabase.functions.invoke('luvvix-translate', {
        body: { action: 'get_languages' }
      });

      if (error) throw error;
      return data.languages || [];
    } catch (error) {
      console.error('Error getting supported languages:', error);
      return [];
    }
  }

  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<Translation> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('luvvix-translate', {
        body: { 
          action: 'translate',
          text,
          target_language: targetLanguage,
          source_language: sourceLanguage,
          user_id: user.id
        }
      });

      if (error) throw error;

      // Save to history
      const translationRecord = {
        user_id: user.id,
        source_text: text,
        translated_text: data.translated_text,
        source_language: data.detected_language || sourceLanguage,
        target_language: targetLanguage,
        confidence: data.confidence || 0.95
      };

      await supabase.from('translation_history').insert(translationRecord);

      return {
        id: Date.now().toString(),
        source_text: text,
        translated_text: data.translated_text,
        source_language: data.detected_language || sourceLanguage || 'auto',
        target_language: targetLanguage,
        confidence: data.confidence || 0.95,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }

  async translateBatch(
    texts: string[], 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<Translation[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('luvvix-translate', {
        body: { 
          action: 'translate_batch',
          texts,
          target_language: targetLanguage,
          source_language: sourceLanguage,
          user_id: user.id
        }
      });

      if (error) throw error;

      const results: Translation[] = data.translations.map((translation: any, index: number) => ({
        id: `${Date.now()}_${index}`,
        source_text: texts[index],
        translated_text: translation.text,
        source_language: translation.detected_language || sourceLanguage || 'auto',
        target_language: targetLanguage,
        confidence: translation.confidence || 0.95,
        created_at: new Date().toISOString()
      }));

      // Save batch to history
      const historyRecords = results.map(result => ({
        user_id: user.id,
        source_text: result.source_text,
        translated_text: result.translated_text,
        source_language: result.source_language,
        target_language: result.target_language,
        confidence: result.confidence
      }));

      await supabase.from('translation_history').insert(historyRecords);

      return results;
    } catch (error) {
      console.error('Error translating batch:', error);
      throw error;
    }
  }

  async detectLanguage(text: string): Promise<{language: string, confidence: number}> {
    try {
      const { data, error } = await supabase.functions.invoke('luvvix-translate', {
        body: { 
          action: 'detect_language',
          text
        }
      });

      if (error) throw error;
      return {
        language: data.language,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('Error detecting language:', error);
      return { language: 'unknown', confidence: 0 };
    }
  }

  async getTranslationHistory(limit: number = 50): Promise<TranslationHistory[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('translation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting translation history:', error);
      return [];
    }
  }

  async deleteFromHistory(id: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('translation_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting from history:', error);
      throw error;
    }
  }

  async clearHistory(): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('translation_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  async getUsageStats(): Promise<{
    total_translations: number,
    translations_today: number,
    most_used_languages: {source: string, target: string, count: number}[]
  }> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      const [totalResult, todayResult, languagesResult] = await Promise.all([
        supabase
          .from('translation_history')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        
        supabase
          .from('translation_history')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', today),
        
        supabase
          .from('translation_history')
          .select('source_language, target_language')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      const languagePairs: {[key: string]: number} = {};
      (languagesResult.data || []).forEach(item => {
        const pair = `${item.source_language}-${item.target_language}`;
        languagePairs[pair] = (languagePairs[pair] || 0) + 1;
      });

      const most_used_languages = Object.entries(languagePairs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([pair, count]) => {
          const [source, target] = pair.split('-');
          return { source, target, count };
        });

      return {
        total_translations: totalResult.count || 0,
        translations_today: todayResult.count || 0,
        most_used_languages
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        total_translations: 0,
        translations_today: 0,
        most_used_languages: []
      };
    }
  }
}

export const translateService = new TranslateService();
export default translateService;
