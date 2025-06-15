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
  signInWithBiometrics: (email?: string) => Promise<boolean>;
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
        
        if (session?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
            
            // Check if the user has biometric data enrolled
            const biometricAvailable = session.user.app_metadata?.has_webauthn_credentials === true;
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
        const biometricAvailable = session.user.app_metadata?.has_webauthn_credentials === true;
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
        const biometricAvailable = user.app_metadata?.has_webauthn_credentials === true;
        setHasBiometrics(biometricAvailable);
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
        const biometricAvailable = data.user.app_metadata?.has_webauthn_credentials === true;
        setHasBiometrics(biometricAvailable);
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
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Compte créé avec succès",
        description: "Bienvenue sur LuvviX ID !",
      });
      
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

  const signInWithBiometrics = async (email?: string) => {
    try {
      // First, check if biometric authentication is available
      const isAvailable = await authentivix.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("L'authentification biométrique n'est pas disponible sur cet appareil");
      }
      
      // Authenticate with biometrics
      const webAuthnSession = await authentivix.authenticateWithBiometrics(email);
      
      if (!webAuthnSession) {
        throw new Error("L'authentification biométrique a échoué");
      }
      
      // Use the tokens from WebAuthn session to log in
      const success = await loginWithToken(
        webAuthnSession.access_token, 
        webAuthnSession.refresh_token
      );
      
      if (success) {
        toast({
          title: "Authentification biométrique réussie",
          description: "Bienvenue sur LuvviX ID"
        });
        return true;
      }
      
      throw new Error("Impossible d'établir la session");
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

  const globalSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
