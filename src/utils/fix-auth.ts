
import { supabase } from '@/integrations/supabase/client';

export const fixUserCreation = async () => {
  try {
    console.log('🔧 Correction de la fonction handle_new_user...');
    
    const { data, error } = await supabase.functions.invoke('fix-user-creation', {});
    
    if (error) {
      console.error('❌ Erreur lors de la correction:', error);
      throw error;
    }
    
    console.log('✅ Fonction handle_new_user corrigée:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur dans fixUserCreation:', error);
    throw error;
  }
};
