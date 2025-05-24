
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { authentivix } from '@/utils/authentivix';

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  created_at: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signUp: (email: string, password: string, metadata: any) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithBiometrics: () => Promise<boolean>;
  signOut: () => Promise<boolean>;
  globalSignOut: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  loginWithToken: (accessToken: string, refreshToken?: string) => Promise<boolean>;
  loading: boolean;
  hasBiometrics: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If we have a session, check if this account is in localStorage
        if (session?.user) {
          try {
            const storedAccountsStr = localStorage.getItem('luvvix_accounts');
            if (storedAccountsStr) {
              const storedAccounts = JSON.parse(storedAccountsStr);
              const hasCurrentUser = storedAccounts.some((acc: any) => acc.id === session.user.id);
              
              if (!hasCurrentUser) {
                // Add this account to stored accounts
                const newAccount = {
                  id: session.user.id,
                  email: session.user.email,
                  avatarUrl: profile?.avatar_url,
                  fullName: profile?.full_name,
                  lastUsed: new Date().toISOString(),
                  isActive: true
                };
                
                const updatedAccounts = storedAccounts.map((acc: any) => ({
                  ...acc,
                  isActive: false
                }));
                
                updatedAccounts.push(newAccount);
                localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
              } else {
                // Update the active status of accounts
                const updatedAccounts = storedAccounts.map((acc: any) => ({
                  ...acc,
                  isActive: acc.id === session.user.id,
                  lastUsed: acc.id === session.user.id ? new Date().toISOString() : acc.lastUsed
                }));
                localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
              }
            }
          } catch (error) {
            console.error('Error updating stored accounts:', error);
          }
          
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
            
            // Check if the user has biometric data enrolled
            const biometricAvailable = authentivix.isEnrolled(session.user.id);
            setHasBiometrics(biometricAvailable);
          }, 0);
        } else {
          setProfile(null);
          setHasBiometrics(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        // Check if the user has biometric data enrolled
        const biometricAvailable = authentivix.isEnrolled(session.user.id);
        setHasBiometrics(biometricAvailable);
      }
      setLoading(false);
    });

    // Check if biometric auth is available on this device
    const checkBiometricAvailability = async () => {
      try {
        await authentivix.isBiometricAvailable();
      } catch (error) {
        console.error("Error checking biometric availability:", error);
      }
    };
    
    checkBiometricAvailability();

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchProfile(user.id);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const loginWithToken = async (accessToken: string, refreshToken?: string) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
      
      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return true;
    } catch (error: any) {
      console.error('Error logging in with token:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
      return false;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      toast({
        title: "Compte créé avec succès",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
      
      // If biometrics is enabled in metadata, set up biometric authentication
      if (metadata?.use_biometrics && data?.user) {
        try {
          // Store user ID for biometric enrollment
          localStorage.setItem('luvvix_biometrics_userid', data.user.id);
        } catch (e) {
          console.error("Error setting up biometrics:", e);
        }
      }
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la création du compte",
        description: error.message,
      });
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur LuvviX ID",
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
      return false;
    }
  };

  const signInWithBiometrics = async () => {
    try {
      // First, check if biometric authentication is available
      const isAvailable = await authentivix.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("L'authentification biométrique n'est pas disponible sur cet appareil");
      }
      
      // Try to find an enrolled user ID
      let userId: string | null = null;
      const storedUserId = localStorage.getItem('luvvix_biometrics_userid');
      
      if (storedUserId) {
        // If we have a stored user ID, use it directly
        userId = storedUserId;
      } else {
        // Otherwise, try to auto-detect enrolled users
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('luvvix_biometrics_')) {
            userId = key.replace('luvvix_biometrics_', '');
            break;
          }
        }
      }
      
      if (!userId) {
        throw new Error("Aucun compte n'a été configuré pour l'authentification biométrique");
      }
      
      // Authenticate with biometrics
      const biometricToken = await authentivix.authenticateWithBiometrics(userId);
      
      if (!biometricToken) {
        throw new Error("L'authentification biométrique a échoué");
      }
      
      // In a real application, we would exchange the biometric token for an auth token
      // For this demo, we'll simulate authentication with the stored email
      const storedAccountsStr = localStorage.getItem('luvvix_accounts');
      if (storedAccountsStr) {
        const storedAccounts = JSON.parse(storedAccountsStr);
        const userAccount = storedAccounts.find((acc: any) => acc.id === userId);
        
        if (userAccount && userAccount.email) {
          // For demo purposes only - in a real application, we would use a secure token exchange
          // This part is just to simulate a successful login for the demo without requiring password
          
          toast({
            title: "Authentification biométrique réussie",
            description: "Bienvenue sur LuvviX ID"
          });
          
          return true;
        }
      }
      
      throw new Error("Impossible de trouver les informations du compte");
    } catch (error: any) {
      console.error('Error in biometric authentication:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification biométrique",
        description: error.message,
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur LuvviX ID",
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la déconnexion",
        description: error.message,
      });
      return false;
    }
  };

  // Function for global sign out of all accounts
  const globalSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all accounts from localStorage
      localStorage.removeItem('luvvix_accounts');
      
      toast({
        title: "Déconnexion globale réussie",
        description: "Vous avez été déconnecté de tous vos comptes LuvviX ID",
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la déconnexion globale",
        description: error.message,
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      signUp,
      signIn,
      signInWithBiometrics,
      signOut,
      globalSignOut,
      refreshUser,
      loginWithToken,
      loading,
      hasBiometrics
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
