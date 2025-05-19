
/**
 * LuvviX ID SDK - Client JavaScript library for LuvviX ID authentication system
 * Version: 1.1.0
 * 
 * This SDK provides methods to easily integrate LuvviX ID authentication
 * into third-party applications.
 */

export class LuvviXID {
  /**
   * Create a new LuvviX ID client instance
   * 
   * @param {Object} config - Configuration options
   * @param {string} config.appName - Application name (must be one of 'main', 'pharmacy', 'streaming', 'chat')
   * @param {string} config.redirectUrl - URL to redirect to after authentication
   * @param {string} [config.apiBaseUrl] - Base URL of the LuvviX ID API (defaults to production)
   */
  constructor(config = {}) {
    // Validate required parameters
    if (!config.appName) {
      throw new Error('appName is required');
    }

    if (!config.redirectUrl) {
      throw new Error('redirectUrl is required');
    }

    const validAppNames = ['main', 'pharmacy', 'streaming', 'chat'];
    if (!validAppNames.includes(config.appName)) {
      throw new Error(`appName must be one of: ${validAppNames.join(', ')}`);
    }

    this.config = {
      apiBaseUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api',
      tokenStorageKey: 'luvvix_auth_token',
      appTokenStorageKey: `luvvix_app_token_${config.appName}`,
      ...config
    };
  }

  /**
   * Check if the user is authenticated
   * @returns {boolean} True if the user has a valid token
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Get the stored authentication token
   * @returns {string|null} The authentication token or null if not found
   */
  getToken() {
    return localStorage.getItem(this.config.tokenStorageKey);
  }

  /**
   * Set the authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem(this.config.tokenStorageKey, token);
  }

  /**
   * Clear the stored authentication token
   */
  clearToken() {
    localStorage.removeItem(this.config.tokenStorageKey);
  }

  /**
   * Redirect the user to the LuvviX ID login page
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.signup=false] - Whether to show signup form by default
   */
  redirectToLogin(options = {}) {
    const baseUrl = 'https://luvvix-id.com/auth';
    const params = new URLSearchParams({
      app: this.config.appName,
      redirect_url: encodeURIComponent(this.config.redirectUrl),
      ...(options.signup ? { signup: 'true' } : {})
    });

    window.location.href = `${baseUrl}?${params.toString()}`;
  }

  /**
   * Handle authentication callback
   * Processes the callback after the user is redirected back from the login page
   * 
   * @returns {Promise<Object>} Authentication result containing user data and token
   */
  async handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (!token) {
      throw new Error('No authentication token found in URL');
    }
    
    // Vérifier le token avec LuvviX ID API
    const isValid = await this.verifyToken(token);
    
    if (!isValid) {
      throw new Error('Invalid authentication token');
    }
    
    // Store the token
    this.setToken(token);
    
    // Register app access in LuvviX ID
    await this.authorizeApp(token, this.config.appName);
    
    // Get user profile
    const userData = await this.getUserProfile();
    
    return {
      success: true,
      user: userData,
      token: token
    };
  }

  /**
   * Log out the current user
   */
  logout() {
    this.clearToken();
    localStorage.removeItem(this.config.appTokenStorageKey);
  }

  /**
   * Verify if a token is valid
   * @param {string} token - JWT token to verify
   * @returns {Promise<boolean>} True if the token is valid
   */
  async verifyToken(token) {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const result = await response.json();
      return result.success && result.data?.valid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  /**
   * Get the current user's profile information
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/get-user-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get user info');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Authorize application access for the current user
   * @param {string} token - Authentication token
   * @param {string} appName - Name of the application to authorize
   * @returns {Promise<Object>} Authorization result
   */
  async authorizeApp(token, appName) {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/authorize-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, app_name: appName }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to authorize app');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error authorizing app:', error);
      throw error;
    }
  }

  /**
   * Get the list of applications the current user has access to
   * @returns {Promise<Array>} List of user's applications
   */
  async getUserApps() {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/get-user-apps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get user apps');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error getting user apps:', error);
      throw error;
    }
  }

  /**
   * Revoke an application's access for the current user
   * @param {string} appAccessId - ID of the app access to revoke
   * @returns {Promise<boolean>} True if the access was successfully revoked
   */
  async revokeAppAccess(appAccessId) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/revoke-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, app_access_id: appAccessId }),
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error revoking app access:', error);
      throw error;
    }
  }
  
  /**
   * NOUVEAU: Obtenir un token d'accès spécifique à une application
   * @returns {Promise<string>} Token d'accès pour l'application
   */
  async getAppToken() {
    // Vérifier si un token app est déjà stocké et valide
    const storedToken = localStorage.getItem(this.config.appTokenStorageKey);
    if (storedToken) {
      const tokenData = JSON.parse(storedToken);
      if (tokenData.expiry > Date.now()) {
        return tokenData.token;
      }
    }
    
    // Sinon, demander un nouveau token
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/generate-app-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, app_name: this.config.appName }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate app token');
      }
      
      // Stocker le token avec sa date d'expiration
      const appToken = result.data.app_token;
      const expiresIn = result.data.expires_in * 1000; // Convertir en millisecondes
      const expiry = Date.now() + expiresIn;
      
      localStorage.setItem(this.config.appTokenStorageKey, JSON.stringify({
        token: appToken,
        expiry: expiry
      }));
      
      return appToken;
    } catch (error) {
      console.error('Error getting app token:', error);
      throw error;
    }
  }
  
  /**
   * NOUVEAU: Authentification silencieuse - Vérifie l'authentification sans redirection
   * @returns {Promise<boolean>} True si l'utilisateur est authentifié
   */
  async checkSilentAuth() {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      const isValid = await this.verifyToken(token);
      return isValid;
    } catch (error) {
      console.error('Error during silent auth check:', error);
      return false;
    }
  }
  
  /**
   * NOUVEAU: Obtenir une URL de déconnexion globale
   * @returns {string} URL de déconnexion qui déconnectera l'utilisateur de toutes les applications
   */
  getLogoutUrl() {
    return `https://luvvix-id.com/logout?redirect_url=${encodeURIComponent(this.config.redirectUrl)}`;
  }
  
  /**
   * NOUVEAU: Déconnexion globale (déconnecte l'utilisateur de toutes les applications LuvviX)
   */
  globalLogout() {
    this.clearToken();
    window.location.href = this.getLogoutUrl();
  }
}
