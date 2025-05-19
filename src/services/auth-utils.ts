
// Cette fonction est nécessaire pour gérer les erreurs d'importation circulaire
import { supabase } from '@/integrations/supabase/client';

/**
 * Utilitaire pour obtenir l'utilisateur courant sans utiliser un hook React
 * Cela évite le problème de "React Hook called in a class component or non-React function"
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export default {
  getCurrentUser
};
