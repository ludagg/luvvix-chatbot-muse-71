import { LuvviXID } from "@/utils/luvvix-id-sdk";
import { authentivix, WebAuthnSession } from '@/utils/authentivix';

interface AuthOptions {
  appName: 'main' | 'pharmacy' | 'streaming' | 'chat';
  redirectUrl: string;
  apiBaseUrl?: string;
}

/**
 * Service d'authentification pour les applications LuvviX ID
 * Permet l'échange de cookies entre applications et la synchronisation de l'état d'authentification
 */
class AuthService {
  private luvvixIdClient: LuvviXID | null = null;
  private options: AuthOptions | null = null;
  private authenticated: boolean = false;
  private authListeners: Array<(isAuthenticated: boolean) => void> = [];
  
  /**
   * Initialise le service d'authentification avec les options spécifiées
   * @param options Options de configuration pour LuvviX ID
   */
  initialize(options: AuthOptions): void {
    try {
      this.options = options;
      this.luvvixIdClient = new LuvviXID({
        appName: options.appName,
        redirectUrl: options.redirectUrl,
        apiBaseUrl: options.apiBaseUrl,
        cookieDomain: '.luvvix.it.com' // Définir le domaine parent pour tous les cookies
      });
      
      // Vérifier l'authentification actuelle
      this.checkAuthStatus();
      
      // Mettre en place un listener pour les changements d'authentification dans d'autres onglets
      window.addEventListener('storage', this.handleStorageChange);
      
      console.log(`LuvviX ID Auth Service initialized for app: ${options.appName} with shared cookies`);
    } catch (error) {
      console.error('Error initializing AuthService:', error);
    }
  }
  
  /**
   * Vérifie si l'utilisateur est actuellement authentifié
   * @returns true si l'utilisateur est authentifié, false sinon
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.luvvixIdClient) {
        throw new Error('AuthService not initialized');
      }
      
      // Vérification silencieuse de l'authentification
      this.authenticated = await this.luvvixIdClient.checkSilentAuth();
      return this.authenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
  
  /**
   * Redirige l'utilisateur vers la page de connexion LuvviX ID
   * @param options Options supplémentaires pour la connexion
   */
  redirectToLogin(options: { signup?: boolean } = {}): void {
    try {
      if (!this.luvvixIdClient) {
        throw new Error('AuthService not initialized');
      }
      
      this.luvvixIdClient.redirectToLogin(options);
    } catch (error) {
      console.error('Error redirecting to login:', error);
    }
  }
  
  /**
   * Traite le retour d'authentification après redirection
   * @returns Résultat de l'authentification contenant les données utilisateur et le token
   */
  async handleCallback() {
    try {
      if (!this.luvvixIdClient) {
        throw new Error('AuthService not initialized');
      }
      
      const result = await this.luvvixIdClient.handleCallback();
      this.authenticated = true;
      this.notifyListeners(true);
      
      // Si l'utilisateur a activé Authentivix, mettre à jour ses données biométriques
      if (result && result.user) {
        const userId = result.user.id;
        if (authentivix.isEnrolled(userId)) {
          // Mettre à jour la date de dernière utilisation
          try {
            await authentivix.authenticateWithBiometrics(result.user.email);
          } catch (e) {
            console.log('Non-critical error updating biometric data:', e);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      this.authenticated = false;
      this.notifyListeners(false);
      throw error;
    }
  }
  
  /**
   * Authentifie l'utilisateur avec la biométrie via Authentivix
   * @returns Résultat de l'authentification ou null si échoué
   */
  async authenticateWithBiometrics() {
    try {
      // Vérifier si Authentivix est disponible
      const isAvailable = await authentivix.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("L'authentification biométrique n'est pas disponible sur cet appareil");
      }
      
      // Authentifier avec biométrie
      const webAuthnSession = await authentivix.authenticateWithBiometrics();
      
      if (!webAuthnSession) {
        throw new Error("L'authentification biométrique a échoué");
      }
      
      // Dans une implémentation réelle, nous écharngerions ce token avec un token JWT valide
      // Pour cette démonstration, nous allons simuler une connexion réussie
      
      // Simuler l'extraction de l'ID utilisateur depuis la session
      const userId = webAuthnSession.user_id;
      
      // Obtenir les infos utilisateur (dans une vraie implémentation, cela proviendrait de l'API)
      // et établir la session
      
      this.authenticated = true;
      this.notifyListeners(true);
      
      return {
        success: true,
        userId: userId
      };
    } catch (error) {
      console.error('Error in biometric authentication:', error);
      return null;
    }
  }
  
  /**
   * Déconnecte l'utilisateur de l'application actuelle
   */
  logout(): void {
    try {
      if (!this.luvvixIdClient) {
        throw new Error('AuthService not initialized');
      }
      
      this.luvvixIdClient.logout();
      this.authenticated = false;
      this.notifyListeners(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
  
  /**
   * Déconnecte l'utilisateur de toutes les applications LuvviX
   */
  globalLogout(): void {
    try {
      if (!this.luvvixIdClient) {
        throw new Error('AuthService not initialized');
      }
      
      this.luvvixIdClient.globalLogout();
      this.authenticated = false;
      this.notifyListeners(false);
    } catch (error) {
      console.error('Error performing global logout:', error);
    }
  }
  
  /**
   * Obtient un token d'accès spécifique à l'application
   * Utile pour les API qui nécessitent une authentification spécifique à l'app
   */
  async getAppToken(): Promise<string | null> {
    try {
      if (!this.luvvixIdClient) {
        throw new Error('AuthService not initialized');
      }
      
      return await this.luvvixIdClient.getAppToken();
    } catch (error) {
      console.error('Error getting app token:', error);
      return null;
    }
  }
  
  /**
   * Récupère les informations du profil utilisateur
   */
  async getUserProfile() {
    try {
      if (!this.luvvixIdClient) {
        throw new Error('AuthService not initialized');
      }
      
      return await this.luvvixIdClient.getUserProfile();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
  
  /**
   * Vérifie l'état actuel d'authentification et notifie les listeners
   */
  private async checkAuthStatus(): Promise<void> {
    const isAuth = await this.isAuthenticated();
    if (isAuth !== this.authenticated) {
      this.authenticated = isAuth;
      this.notifyListeners(isAuth);
    }
  }
  
  /**
   * Gère les changements de stockage (pour la synchronisation entre onglets)
   */
  private handleStorageChange = (event: StorageEvent) => {
    if (!this.options) return;
    
    // Si le token a changé, mettre à jour l'état d'authentification
    if (event.key === 'luvvix_auth_token' || event.key === `luvvix_app_token_${this.options.appName}`) {
      this.checkAuthStatus();
    }
  }
  
  /**
   * Ajoute un écouteur pour les changements d'état d'authentification
   */
  addAuthListener(listener: (isAuthenticated: boolean) => void): void {
    this.authListeners.push(listener);
  }
  
  /**
   * Supprime un écouteur pour les changements d'état d'authentification
   */
  removeAuthListener(listener: (isAuthenticated: boolean) => void): void {
    this.authListeners = this.authListeners.filter(l => l !== listener);
  }
  
  /**
   * Notifie tous les écouteurs d'un changement d'état d'authentification
   */
  private notifyListeners(isAuthenticated: boolean): void {
    this.authListeners.forEach(listener => listener(isAuthenticated));
  }
  
  /**
   * Nettoie les ressources utilisées par le service
   */
  cleanup(): void {
    window.removeEventListener('storage', this.handleStorageChange);
    this.authListeners = [];
    this.luvvixIdClient = null;
    this.options = null;
  }
}

// Exporter une instance unique du service d'authentification
export const authService = new AuthService();
export default authService;
