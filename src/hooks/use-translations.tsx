
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

export const useTranslations = () => {
  const { user } = useAuth();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);

  const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
  ) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('luvvix-translate-api', {
        body: {
          text,
          from: sourceLang,
          to: targetLang
        }
      });

      if (data?.success) {
        // Sauvegarder la traduction
        await supabase
          .from('translations')
          .insert({
            user_id: user.id,
            source_text: text,
            translated_text: data.data.translatedText,
            source_language: data.data.fromLanguage,
            target_language: targetLang
          });

        await fetchTranslations();
        return data.data.translatedText;
      }
    } catch (error) {
      toast({
        title: "Erreur de traduction",
        description: "Impossible de traduire le texte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    return null;
  };

  const fetchTranslations = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setTranslations(data);
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTranslations();
    }
  }, [user]);

  return {
    translations,
    loading,
    translateText,
    refreshTranslations: fetchTranslations
  };
};
