
/**
 * Service for synchronizing authentication state between domains and subdomains
 */
export class AuthSync {
  private static instance: AuthSync;
  private syncInterval: number | null = null;
  private readonly localStorageKey = 'luvvix_auth_sync';
  private readonly cookieName = 'luvvix_auth_token';
  private readonly syncCheckInterval = 3000; // Check every 3 seconds
  private readonly domain = '.luvvix.it.com'; // Root domain for cookies
  
  private constructor() {
    // Private constructor to enforce singleton
  }
  
  public static getInstance(): AuthSync {
    if (!AuthSync.instance) {
      AuthSync.instance = new AuthSync();
    }
    return AuthSync.instance;
  }
  
  /**
   * Start synchronizing authentication state between domains and subdomains
   */
  public startSync(): void {
    if (this.syncInterval) {
      return; // Already running
    }
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    // Set up the sync interval
    this.syncInterval = window.setInterval(() => {
      this.checkForAuthChanges();
    }, this.syncCheckInterval);
    
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', this.handleStorageChange);
    
    console.log('Auth sync started for cross-domain authentication');
    
    // Perform initial sync
    this.checkForAuthChanges();
  }
  
  /**
   * Stop synchronizing authentication state
   */
  public stopSync(): void {
    if (!this.syncInterval) {
      return; // Not running
    }
    
    clearInterval(this.syncInterval);
    this.syncInterval = null;
    
    // Remove storage event listener
    window.removeEventListener('storage', this.handleStorageChange);
    
    console.log('Auth sync stopped');
  }
  
  /**
   * Handle storage changes from other tabs/windows
   */
  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === this.localStorageKey || event.key === 'sb-qlhovvqcwjdbirmekdoy-auth-token') {
      console.log('Auth sync detected change from another tab/window');
      this.syncAuthState();
    }
  };
  
  /**
   * Check for authentication changes and sync if necessary
   */
  private checkForAuthChanges(): void {
    try {
      // Get current Supabase session
      const currentSession = localStorage.getItem('sb-qlhovvqcwjdbirmekdoy-auth-token');
      
      // Get current sync state
      const syncState = localStorage.getItem(this.localStorageKey);
      
      // If they don't match, we need to sync
      if (currentSession !== syncState) {
        console.log('Auth state mismatch detected, syncing across domains...');
        localStorage.setItem(this.localStorageKey, currentSession || '');
        this.syncAuthState();
      }
    } catch (error) {
      console.error('Error checking for auth changes:', error);
    }
  }
  
  /**
   * Check if we're currently on a subdomain
   */
  private isOnSubdomain(): boolean {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    return parts.length > 2;
  }
  
  /**
   * Get the root domain from the current hostname
   */
  private getRootDomain(): string {
    const hostname = window.location.hostname;
    
    // Extract root domain (e.g., from forms.luvvix.it.com -> .luvvix.it.com)
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname; // Already on root domain
    
    // Return root domain with leading dot for cookie compatibility
    return '.' + parts.slice(-3).join('.');
  }
  
  /**
   * Synchronize authentication state across the application domains and subdomains
   */
  private syncAuthState(): void {
    try {
      const syncToken = localStorage.getItem(this.localStorageKey);
      const rootDomain = this.getRootDomain();
      
      if (syncToken) {
        // We have an authentication token, ensure it's set in all places
        localStorage.setItem('sb-qlhovvqcwjdbirmekdoy-auth-token', syncToken);
        
        // Set a cross-domain cookie for all subdomains
        this.setCrossDomainCookie(this.cookieName, syncToken, {
          domain: rootDomain,
          maxAge: 604800, // 7 days
          path: '/',
          secure: true,
          sameSite: 'Strict'
        });
        
        console.log(`Auth state synchronized across domains using root domain: ${rootDomain}`);
      } else {
        // No authentication token, clear everywhere
        localStorage.removeItem('sb-qlhovvqcwjdbirmekdoy-auth-token');
        
        // Clear the cross-domain cookie
        this.setCrossDomainCookie(this.cookieName, '', {
          domain: rootDomain,
          maxAge: 0,
          path: '/',
          secure: true,
          sameSite: 'Strict'
        });
        
        console.log('Auth state cleared across all domains');
      }
    } catch (error) {
      console.error('Error synchronizing auth state:', error);
    }
  }
  
  /**
   * Helper function to set a cross-domain cookie
   */
  private setCrossDomainCookie(name: string, value: string, options: {
    domain: string;
    maxAge: number;
    path: string;
    secure: boolean;
    sameSite: string;
  }): void {
    try {
      const cookieValue = encodeURIComponent(value);
      let cookie = `${name}=${cookieValue}; Path=${options.path}; Domain=${options.domain}; Max-Age=${options.maxAge}`;
      
      if (options.secure) cookie += '; Secure';
      if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
      
      document.cookie = cookie;
      console.log(`Cookie set: ${name} on domain ${options.domain}`);
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  }
  
  /**
   * Manually force a sync (useful after login/logout operations)
   */
  public forceSync(): void {
    this.syncAuthState();
  }
  
  /**
   * Check if the current browser supports third-party cookies
   * This is just a helper method to detect potential issues
   */
  public static checkCookieSupport(): Promise<boolean> {
    return new Promise(resolve => {
      const testCookieName = 'luvvix_cookie_test';
      document.cookie = `${testCookieName}=1; path=/; SameSite=None; Secure`;
      
      setTimeout(() => {
        const hasCookie = document.cookie.indexOf(testCookieName) !== -1;
        resolve(hasCookie);
      }, 100);
    });
  }
}

export default AuthSync.getInstance();
