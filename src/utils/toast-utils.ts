
import { toast as sonnerToast } from "@/hooks/use-toast";

/**
 * Wrapper autour de la fonction toast pour éviter les erreurs TypeScript
 * et standardiser l'usage des toasts dans l'application
 */
export const showToast = {
  /**
   * Affiche une notification standard
   */
  info: (title: string, description?: string) => {
    return sonnerToast(title, { description });
  },
  
  /**
   * Affiche une notification de succès
   */
  success: (title: string, description?: string) => {
    return sonnerToast(title, { description });
  },
  
  /**
   * Affiche une notification d'erreur
   */
  error: (title: string, description?: string) => {
    return sonnerToast.error(title, { description });
  },
  
  /**
   * Affiche une notification d'avertissement
   */
  warning: (title: string, description?: string) => {
    return sonnerToast(title, { description });
  }
};
