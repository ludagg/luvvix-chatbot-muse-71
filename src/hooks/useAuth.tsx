
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import authSync from '@/services/auth-sync';

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
  signUp: (email: string, password: string, metadata: { full_name: string; username: string }) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  globalSignOut: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Initializing AuthProvider...");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, "with session:", newSession ? "present" : "null");
        
        // Only update synchronously first
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Force cross-domain sync
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("Synchronizing session across domains after sign in or token refresh");
          authSync.forceSync();
        } else if (event === 'SIGNED_OUT') {
          console.log("Synchronizing session removal across domains after sign out");
          authSync.forceSync();
        }
        
        // If we have a session, check or update stored accounts
        if (newSession?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            updateStoredAccounts(newSession.user);
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    console.log("Checking for existing session...");
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Retrieved session:", existingSession ? "present" : "null");
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        console.log("Session found, fetching user profile...");
        updateStoredAccounts(existingSession.user);
        fetchProfile(existingSession.user.id);
      }
      
      setLoading(false);
    })
    .catch(error => {
      console.error("Error retrieving session:", error);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscriptions");
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to update stored accounts
  const updateStoredAccounts = (user: User) => {
    try {
      const storedAccountsStr = localStorage.getItem('luvvix_accounts');
      
      if (storedAccountsStr) {
        const storedAccounts = JSON.parse(storedAccountsStr);
        const hasCurrentUser = storedAccounts.some((acc: any) => acc.id === user.id);
        
        if (!hasCurrentUser) {
          // Add this account to stored accounts
          const newAccount = {
            id: user.id,
            email: user.email,
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
          console.log("Added new account to stored accounts:", user.email);
        } else {
          // Update the active status of accounts
          const updatedAccounts = storedAccounts.map((acc: any) => ({
            ...acc,
            isActive: acc.id === user.id,
            lastUsed: acc.id === user.id ? new Date().toISOString() : acc.lastUsed
          }));
          localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
          console.log("Updated active status for account:", user.email);
        }
      } else {
        // Initialize accounts storage with this user
        const newAccounts = [{
          id: user.id,
          email: user.email,
          avatarUrl: profile?.avatar_url,
          fullName: profile?.full_name,
          lastUsed: new Date().toISOString(),
          isActive: true
        }];
        localStorage.setItem('luvvix_accounts', JSON.stringify(newAccounts));
        console.log("Initialized stored accounts with:", user.email);
      }
    } catch (error) {
      console.error('Error updating stored accounts:', error);
    }
  };

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

      console.log("Profile fetched successfully:", data?.username || data?.full_name);
      setProfile(data);
      
      // Update stored account with profile data if available
      try {
        const storedAccountsStr = localStorage.getItem('luvvix_accounts');
        if (storedAccountsStr && data) {
          const storedAccounts = JSON.parse(storedAccountsStr);
          const updatedAccounts = storedAccounts.map((acc: any) => {
            if (acc.id === userId) {
              return {
                ...acc,
                avatarUrl: data.avatar_url,
                fullName: data.full_name
              };
            }
            return acc;
          });
          localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
        }
      } catch (error) {
        console.error('Error updating stored account with profile data:', error);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, metadata: { full_name: string; username: string }) => {
    try {
      console.log("Starting signup process for:", email);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      console.log("Signup successful for:", email);
      toast({
        title: "Compte créé avec succès",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
      
      // Force sync after signup
      authSync.forceSync();
      
      return true;
    } catch (error: any) {
      console.error("Signup failed:", error.message);
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
      console.log("Starting signin process for:", email);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log("Signin successful for:", email);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur LuvviX ID",
      });
      
      // Force sync after signin
      authSync.forceSync();
      
      return true;
    } catch (error: any) {
      console.error("Signin failed:", error.message);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      console.log("Starting signout process...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Signout successful");
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur LuvviX ID",
      });
      
      // Force sync after signout
      authSync.forceSync();
      
      return true;
    } catch (error: any) {
      console.error("Signout failed:", error.message);
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
      console.log("Starting global signout process...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all accounts from localStorage
      localStorage.removeItem('luvvix_accounts');
      console.log("Removed all stored accounts");
      
      toast({
        title: "Déconnexion globale réussie",
        description: "Vous avez été déconnecté de tous vos comptes LuvviX ID",
      });
      
      // Force sync after global signout
      authSync.forceSync();
      
      return true;
    } catch (error: any) {
      console.error("Global signout failed:", error.message);
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
      signOut,
      globalSignOut,
      loading
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
