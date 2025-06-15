
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
  is_favorite: boolean;
  created_at: string;
}

export const useTranslations = () => {
  const [history, setHistory] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const translateText = async (text: string, from: string, to: string) => {
    if (!user) return null;
    
    setLoading(true);
    try {
      // Utiliser l'edge function gemini-translate qui fonctionne
      const { data, error } = await supabase.functions.invoke('gemini-translate', {
        body: { 
          text, 
          fromLanguage: from === 'auto' ? 'auto' : from, 
          toLanguage: to,
          context: 'General translation'
        },
      });

      if (error) throw error;
      
      // Sauvegarder dans l'historique si la traduction réussit
      if (data && data.translatedText) {
        try {
          await supabase
            .from('translations')
            .insert([{
              user_id: user.id,
              source_text: text,
              translated_text: data.translatedText,
              source_language: data.detectedLanguage || from,
              target_language: to,
            }]);
          
          await fetchHistory();
        } catch (saveError) {
          console.error('Error saving translation:', saveError);
          // Ne pas bloquer l'utilisateur si la sauvegarde échoue
        }
      }
      
      toast({
        title: "Traduction terminée",
        description: "Le texte a été traduit avec succès",
      });
      
      return data;
    } catch (error) {
      console.error('Error translating:', error);
      toast({
        title: "Erreur de traduction",
        description: "Impossible de traduire le texte",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const toggleFavorite = async (translationId: string, isFavorite: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('translations')
        .update({ is_favorite: isFavorite })
        .eq('id', translationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchHistory();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le favori",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  return {
    history,
    loading,
    translateText,
    toggleFavorite,
    refetch: fetchHistory,
  };
};
