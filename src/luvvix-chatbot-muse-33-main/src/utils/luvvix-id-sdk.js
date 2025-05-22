
// Simplified mock version of the LuvviX ID SDK
export class LuvviXID {
  constructor(options) {
    this.options = options;
    console.log("LuvviX ID SDK initialized with options:", options);
  }

  async checkSilentAuth() {
    // Mock implementation - check token in localStorage
    const token = localStorage.getItem('luvvix_auth_token');
    return !!token;
  }

  redirectToLogin(options = {}) {
    console.log("Redirecting to LuvviX ID login page with options:", options);
    // In a real implementation this would redirect to the login page
    // For testing purposes, we'll just simulate storing a token
    localStorage.setItem('luvvix_auth_token', 'mock_token_' + Date.now());
    if (this.options.redirectUrl) {
      window.location.href = this.options.redirectUrl;
    }
  }

  async handleCallback() {
    // Mock implementation
    console.log("Handling LuvviX ID callback");
    return {
      user: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'Test User'
      },
      token: 'mock_token_' + Date.now()
    };
  }

  logout() {
    console.log("Logging out from LuvviX ID");
    localStorage.removeItem('luvvix_auth_token');
  }

  globalLogout() {
    console.log("Global logout from all LuvviX applications");
    // Clear all luvvix related items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('luvvix_')) {
        localStorage.removeItem(key);
      }
    });
  }

  async getAppToken() {
    return localStorage.getItem('luvvix_auth_token');
  }

  async getUserProfile() {
    return {
      id: 'user_123',
      email: 'user@example.com',
      name: 'Test User',
      avatar: 'https://ui-avatars.com/api/?name=Test+User'
    };
  }
}

export default LuvviXID;
