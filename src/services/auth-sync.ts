
/**
 * Service for synchronizing authentication state between domains
 */
export class AuthSync {
  private static instance: AuthSync;
  private syncInterval: number | null = null;
  private readonly localStorageKey = 'luvvix_auth_sync';
  private readonly syncCheckInterval = 5000; // Check every 5 seconds
  
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
   * Start synchronizing authentication state between domains
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
    
    console.log('Auth sync started');
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
    if (event.key === this.localStorageKey) {
      console.log('Auth sync detected change from another tab/window');
      this.syncAuthState();
    }
  };
  
  /**
   * Check for authentication changes and sync if necessary
   */
  private checkForAuthChanges(): void {
    // Get current Supabase session
    const currentSession = localStorage.getItem('sb-qlhovvqcwjdbirmekdoy-auth-token');
    
    // Get current sync state
    const syncState = localStorage.getItem(this.localStorageKey);
    
    // If they don't match, we need to sync
    if (currentSession !== syncState) {
      console.log('Auth state mismatch detected, syncing...');
      localStorage.setItem(this.localStorageKey, currentSession || '');
      this.syncAuthState();
    }
  }
  
  /**
   * Synchronize authentication state across the application
   */
  private syncAuthState(): void {
    const syncToken = localStorage.getItem(this.localStorageKey);
    
    if (syncToken) {
      // We have an authentication token, ensure it's set in all places
      localStorage.setItem('sb-qlhovvqcwjdbirmekdoy-auth-token', syncToken);
      document.cookie = `luvvix_auth_token=${encodeURIComponent(syncToken)}; path=/; domain=.luvvix.it.com; max-age=604800; secure; samesite=strict`;
    } else {
      // No authentication token, clear everywhere
      localStorage.removeItem('sb-qlhovvqcwjdbirmekdoy-auth-token');
      document.cookie = `luvvix_auth_token=; path=/; domain=.luvvix.it.com; max-age=0; secure; samesite=strict`;
    }
    
    console.log('Auth state synchronized across domains');
  }
}

export default AuthSync.getInstance();
