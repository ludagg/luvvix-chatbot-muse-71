
/**
 * Authentivix - Système d'authentification biométrique pour LuvviX ID
 * Version 1.0.0
 */

// Types pour le système d'authentification biométrique
export interface BiometricCredential {
  id: string;
  userId: string;
  createdAt: number;
  lastUsed: number;
  type: 'fingerprint' | 'face' | 'other';
}

export interface AuthentivixOptions {
  apiUrl?: string;
  storageKey?: string;
  autoPrompt?: boolean;
}

// Classe principale pour la gestion de l'authentification biométrique
export class Authentivix {
  private options: Required<AuthentivixOptions>;
  
  constructor(options?: AuthentivixOptions) {
    this.options = {
      apiUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api',
      storageKey: 'luvvix_biometrics',
      autoPrompt: false,
      ...options
    };
  }
  
  /**
   * Vérifie si l'authentification biométrique est disponible sur l'appareil
   * @returns {Promise<boolean>} True si disponible, False sinon
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      // Vérifier si l'API Web Authentication est disponible
      if (!window.PublicKeyCredential) {
        return false;
      }
      
      // Vérifier si l'appareil supporte l'authentification biométrique
      // Note: Cette API est encore expérimentale et peut nécessiter des adaptations
      if ('PublicKeyCredential' in window &&
          // @ts-ignore - Cette propriété existe mais n'est pas encore standardisée
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        // @ts-ignore
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de la disponibilité biométrique:', error);
      return false;
    }
  }
  
  /**
   * Vérifie si l'utilisateur a déjà configuré l'authentification biométrique
   * @param {string} userId - Identifiant de l'utilisateur
   * @returns {boolean} True si configuré, False sinon
   */
  isEnrolled(userId: string): boolean {
    try {
      const storedData = localStorage.getItem(`${this.options.storageKey}_${userId}`);
      return !!storedData;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'inscription biométrique:', error);
      return false;
    }
  }
  
  /**
   * Enregistre les données biométriques de l'utilisateur
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {string} token - Token d'authentification
   * @returns {Promise<boolean>} True si l'inscription réussit, False sinon
   */
  async enrollBiometrics(userId: string, token: string): Promise<boolean> {
    try {
      // Dans un environnement de production, cette opération serait effectuée avec le serveur
      // et l'API Web Authentication (navigator.credentials.create)
      
      // Simuler l'enregistrement pour la démo
      const credential: BiometricCredential = {
        id: Math.random().toString(36).substring(2, 15),
        userId: userId,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        type: 'fingerprint'
      };
      
      localStorage.setItem(`${this.options.storageKey}_${userId}`, JSON.stringify(credential));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement biométrique:', error);
      return false;
    }
  }
  
  /**
   * Authentifie l'utilisateur avec ses données biométriques
   * @param {string} userId - Identifiant de l'utilisateur (optionnel si autoPrompt est true)
   * @returns {Promise<string|null>} Token d'authentification ou null si échec
   */
  async authenticateWithBiometrics(userId?: string): Promise<string | null> {
    try {
      // Vérifier si l'authentification biométrique est disponible
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("L'authentification biométrique n'est pas disponible sur cet appareil");
      }
      
      // Si userId n'est pas fourni et autoPrompt est activé, chercher tous les credentials stockés
      if (!userId && this.options.autoPrompt) {
        // Parcourir le localStorage pour trouver les credentials biométriques
        const userIds: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(this.options.storageKey + '_')) {
            const extractedUserId = key.replace(this.options.storageKey + '_', '');
            userIds.push(extractedUserId);
          }
        }
        
        if (userIds.length === 0) {
          throw new Error("Aucune donnée biométrique enregistrée");
        }
        
        // Utiliser le premier utilisateur trouvé
        userId = userIds[0];
      }
      
      if (!userId) {
        throw new Error("ID utilisateur requis pour l'authentification biométrique");
      }
      
      // Vérifier si l'utilisateur a déjà configuré l'authentification biométrique
      if (!this.isEnrolled(userId)) {
        throw new Error("L'utilisateur n'a pas configuré l'authentification biométrique");
      }
      
      // Dans un environnement de production, cette opération serait effectuée avec le serveur
      // et l'API Web Authentication (navigator.credentials.get)
      
      // Simuler l'authentification pour la démo
      const storedDataStr = localStorage.getItem(`${this.options.storageKey}_${userId}`);
      if (!storedDataStr) {
        throw new Error("Données biométriques non trouvées");
      }
      
      const storedData: BiometricCredential = JSON.parse(storedDataStr);
      
      // Mise à jour de la date de dernière utilisation
      storedData.lastUsed = Date.now();
      localStorage.setItem(`${this.options.storageKey}_${userId}`, JSON.stringify(storedData));
      
      // Générer un token simulé
      const simulatedToken = btoa(`${userId}:${Date.now()}`);
      return simulatedToken;
    } catch (error) {
      console.error('Erreur lors de l\'authentification biométrique:', error);
      return null;
    }
  }
  
  /**
   * Supprime les données biométriques de l'utilisateur
   * @param {string} userId - Identifiant de l'utilisateur
   * @returns {boolean} True si la suppression réussit, False sinon
   */
  removeBiometrics(userId: string): boolean {
    try {
      localStorage.removeItem(`${this.options.storageKey}_${userId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression des données biométriques:', error);
      return false;
    }
  }
}

// Export d'une instance singleton pour une utilisation facile
export const authentivix = new Authentivix();
export default authentivix;
