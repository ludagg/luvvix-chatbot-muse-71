
/**
 * Script d'intégration LuvviX ID pour applications externes
 * Version: 1.0.0
 */
(function(window) {
  'use strict';

  const LuvvixAuthIntegration = {
    config: {
      apiBaseUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api',
      tokenLocalStorageKey: 'luvvix_ext_auth_token',
      userLocalStorageKey: 'luvvix_ext_auth_user',
      callbackPath: '/auth/callback',
      luvvixPath: '/auth/luvvix'
    },
    
    /**
     * Initialise l'intégration avec LuvviX ID
     * @param {Object} options - Options de configuration
     */
    init: function(options = {}) {
      // Fusionner les options fournies avec la configuration par défaut
      this.config = { ...this.config, ...options };
      
      // Vérifier si nous sommes sur une URL de callback
      const currentPath = window.location.pathname;
      
      if (currentPath === this.config.luvvixPath) {
        this._handleLuvvixAuth();
      } else if (currentPath === this.config.callbackPath) {
        this._handleCallback();
      }
      
      // Vérifier si l'utilisateur est déjà connecté
      return this.isAuthenticated();
    },
    
    /**
     * Vérifie si un utilisateur est actuellement authentifié
     * @returns {boolean} - Vrai si l'utilisateur est authentifié
     */
    isAuthenticated: function() {
      const token = localStorage.getItem(this.config.tokenLocalStorageKey);
      return !!token;
    },
    
    /**
     * Obtient les informations de l'utilisateur connecté
     * @returns {Object|null} - Les informations utilisateur ou null si non connecté
     */
    getUser: function() {
      const userStr = localStorage.getItem(this.config.userLocalStorageKey);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
      return null;
    },
    
    /**
     * Déconnecte l'utilisateur
     */
    logout: function() {
      localStorage.removeItem(this.config.tokenLocalStorageKey);
      localStorage.removeItem(this.config.userLocalStorageKey);
      
      // Déclencher un événement de déconnexion
      const event = new CustomEvent('luvvix_logout');
      window.dispatchEvent(event);
    },
    
    /**
     * Gère la réception d'un token LuvviX ID
     * @private
     */
    _handleLuvvixAuth: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userId = urlParams.get('user_id');
      const redirectUri = urlParams.get('redirect_uri');
      
      if (!token) {
        this._redirectWithError('Token manquant');
        return;
      }
      
      // Vérifier le token auprès de l'API LuvviX ID
      fetch(this.config.apiBaseUrl + '/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data?.valid) {
          // Récupérer les informations utilisateur
          return fetch(this.config.apiBaseUrl + '/get-user-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          })
          .then(response => response.json())
          .then(userData => {
            if (userData.success) {
              // Stocker les informations de l'utilisateur
              localStorage.setItem(this.config.tokenLocalStorageKey, token);
              localStorage.setItem(this.config.userLocalStorageKey, JSON.stringify(userData.data));
              
              // Rediriger vers la page de redirection ou la page d'accueil
              const redirectTo = redirectUri || '/';
              window.location.href = redirectTo;
            } else {
              this._redirectWithError("Impossible de récupérer les informations utilisateur");
            }
          });
        } else {
          this._redirectWithError("Token invalide");
        }
      })
      .catch(error => {
        console.error('Erreur lors de la vérification du token:', error);
        this._redirectWithError("Erreur de communication avec le serveur");
      });
    },
    
    /**
     * Gère le callback après authentification
     * @private
     */
    _handleCallback: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      
      if (error) {
        console.error('Erreur d\'authentification:', error);
        // Afficher un message d'erreur à l'utilisateur
      } else {
        // Vérifier si l'utilisateur est connecté
        if (this.isAuthenticated()) {
          // Déclencher un événement de connexion réussie
          const event = new CustomEvent('luvvix_login', { 
            detail: { user: this.getUser() }
          });
          window.dispatchEvent(event);
          
          // Rediriger vers la page d'accueil ou la page demandée
          const returnTo = urlParams.get('return_to') || '/';
          window.history.replaceState({}, document.title, returnTo);
        }
      }
    },
    
    /**
     * Redirige avec un message d'erreur
     * @param {string} errorMessage - Message d'erreur
     * @private
     */
    _redirectWithError: function(errorMessage) {
      window.location.href = this.config.callbackPath + '?error=' + encodeURIComponent(errorMessage);
    }
  };
  
  // Exposer l'objet d'intégration au niveau global
  window.LuvvixAuthIntegration = LuvvixAuthIntegration;
  
})(window);
