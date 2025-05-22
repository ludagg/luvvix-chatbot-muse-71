
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, AlertCircle, UserCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StoredAccount {
  id: string;
  email: string;
  avatarUrl?: string;
  fullName?: string;
  lastUsed?: string;
}

const OAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storedAccounts, setStoredAccounts] = useState<StoredAccount[]>([]);
  const [appInfo, setAppInfo] = useState<{
    name: string;
    description: string;
    redirectUri: string;
  } | null>(null);

  // Extract parameters from URL
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope")?.split(" ") || ["profile"];

  useEffect(() => {
    // Load stored accounts from localStorage
    const loadStoredAccounts = () => {
      try {
        const stored = localStorage.getItem('luvvix_accounts');
        if (stored) {
          const accounts = JSON.parse(stored);
          setStoredAccounts(accounts);
        }
      } catch (error) {
        console.error('Error loading stored accounts:', error);
      }
    };

    loadStoredAccounts();
  }, []);

  useEffect(() => {
    const validateAndFetchApp = async () => {
      setLoading(true);

      if (!clientId) {
        setError("Paramètre client_id manquant");
        setLoading(false);
        return;
      }

      if (!redirectUri) {
        setError("Paramètre redirect_uri manquant");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("application")
          .select("*")
          .eq("clientid", clientId)
          .single();

        if (error || !data) {
          setError("Application non trouvée ou non autorisée");
          setLoading(false);
          return;
        }

        const allowedRedirectUris = data.redirecturis || [];
        if (!allowedRedirectUris.includes(redirectUri)) {
          setError(`URI de redirection non autorisée: ${redirectUri}`);
          setLoading(false);
          return;
        }

        setAppInfo({
          name: data.name,
          description: data.description || "",
          redirectUri,
        });

        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la validation de l'application:", err);
        setError("Une erreur est survenue lors de la vérification de l'application");
        setLoading(false);
      }
    };

    validateAndFetchApp();
  }, [clientId, redirectUri]);

  const handleAuthorize = async (selectedUserId?: string) => {
    if ((!user && !selectedUserId) || !clientId || !appInfo) return;

    setLoading(true);
    
    try {
      let session;

      if (selectedUserId && selectedUserId !== user?.id) {
        // If a different account is selected, we'll switch to it directly
        const storedAccount = storedAccounts.find(account => account.id === selectedUserId);
        if (!storedAccount) {
          throw new Error("Compte non trouvé");
        }

        // Update stored accounts to mark the selected account as active
        const updatedAccounts = storedAccounts.map(acc => ({
          ...acc,
          isActive: acc.id === selectedUserId,
          lastUsed: acc.id === selectedUserId ? new Date().toISOString() : acc.lastUsed
        }));
        localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
        
        // Redirect to the same OAuth page - the session will be established on next load
        toast({
          title: "Changement de compte",
          description: `Connexion avec ${storedAccount.fullName || storedAccount.email} en cours...`
        });
        
        // Redirect to the same page to allow the auth state to update
        window.location.reload();
        return;
      }

      // Use the session of the current user
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData.session;
      
      if (!session) {
        throw new Error("Session expirée");
      }

      // Enregistrer la connexion dans la base de données
      const { error: connectionError } = await supabase.from("appconnection").upsert({
        userid: session.user.id,
        applicationid: clientId,
        scopes: scope,
        lastused: new Date().toISOString(),
      }, { 
        onConflict: 'userid,applicationid' 
      });

      if (connectionError) {
        console.error("Erreur lors de l'enregistrement de la connexion:", connectionError);
      }

      // Générer l'URL de redirection avec le token
      const token = session.access_token;
      const finalRedirectUri = new URL(appInfo.redirectUri);
      
      finalRedirectUri.searchParams.append("token", token);
      
      if (profile) {
        finalRedirectUri.searchParams.append("user_id", session.user.id);
        finalRedirectUri.searchParams.append("username", profile.username || "");
        finalRedirectUri.searchParams.append("name", profile.full_name || "");
      }
      
      if (state) {
        finalRedirectUri.searchParams.append("state", state);
      }

      // Rediriger vers l'application
      window.location.href = finalRedirectUri.toString();
    } catch (error: any) {
      console.error("Erreur lors de l'autorisation:", error);
      toast({
        variant: "destructive",
        title: "Échec de l'autorisation",
        description: error.message || "Une erreur est survenue",
      });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading && !error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-500">
            <AlertCircle className="h-6 w-6" />
            Erreur de connexion
          </CardTitle>
          <CardDescription>
            Impossible de se connecter à l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">{error}</p>
          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Retourner au tableau de bord
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Connexion à {appInfo?.name}</CardTitle>
        <CardDescription>{appInfo?.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <ShieldCheck className="h-16 w-16 text-green-500" />
          
          {storedAccounts.length > 0 ? (
            <>
              <h3 className="text-lg font-medium">Choisissez un compte :</h3>
              <div className="w-full space-y-2">
                {storedAccounts.map((account) => (
                  <Button
                    key={account.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAuthorize(account.id)}
                  >
                    <div className="flex items-center gap-3">
                      {account.avatarUrl ? (
                        <img
                          src={account.avatarUrl}
                          alt={account.email}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <UserCircle2 className="w-8 h-8 text-gray-400" />
                      )}
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {account.fullName || account.email}
                        </span>
                        {account.fullName && (
                          <span className="text-sm text-gray-500">{account.email}</span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              
              <div className="relative w-full py-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Ou</span>
                </div>
              </div>
            </>
          ) : (
            <h3 className="text-lg font-medium">Se connecter avec :</h3>
          )}

          {user && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg w-full">
              <p className="font-medium">{profile?.full_name || user.email}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 text-center">
            Cette application aura accès à votre nom et email.
            Vous pouvez révoquer l'accès à tout moment depuis le tableau de bord.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {user && (
          <Button onClick={() => handleAuthorize()} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Autoriser la connexion"
            )}
          </Button>
        )}
        <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
          Utiliser un autre compte
        </Button>
        <Button onClick={handleCancel} variant="ghost" className="w-full">
          Annuler
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OAuthHandler;
