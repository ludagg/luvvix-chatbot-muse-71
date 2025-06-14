
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
      const { data, error } = await supabase.functions.invoke('luvvix-translate-api/translate', {
        body: { text, from, to },
      });

      if (error) throw error;
      
      await fetchHistory();
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
      const { data, error } = await supabase.functions.invoke('luvvix-translate-api/history');

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const toggleFavorite = async (translationId: string, isFavorite: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke(`luvvix-translate-api/favorite/${translationId}`, {
        body: { isFavorite },
      });

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
