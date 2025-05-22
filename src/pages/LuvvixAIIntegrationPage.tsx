
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LuvvixAIIntegrationPage = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appUrl, setAppUrl] = useState("https://luvvix-ai.com");
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Intégrer LuvviX AI | LuvviX ID";
    
    // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
    if (!user && !loading) {
      navigate("/auth?return_to=/ai-integration");
    }
  }, [user, loading, navigate]);
  
  // Générer un token temporaire pour l'intégration
  const generateIntegrationToken = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!session) {
        throw new Error("Session non disponible");
      }
      
      // Enregistrer l'intention d'intégration dans la base de données
      const { data, error: insertError } = await supabase
        .from("application")
        .upsert({
          name: "LuvviX AI External",
          clientid: "luvvix-ai-ext",
          clientsecret: crypto.randomUUID(),
          redirecturis: [appUrl + "/auth/callback", "http://localhost:3000/auth/callback"],
          description: "Intégration externe de LuvviX AI",
          created_by: user?.id,
          updated_at: new Date().toISOString()
        }, { onConflict: "clientid" });
      
      if (insertError) {
        throw new Error("Erreur lors de l'enregistrement de l'application: " + insertError.message);
      }
      
      // Récupérer un token avec une expiration courte
      const integrationToken = session.access_token;
      setToken(integrationToken);
      setSuccess(true);
      
      toast({
        title: "Token généré avec succès",
        description: "Le token d'intégration a été créé et sera valide pendant 1 heure.",
      });
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la génération du token",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Construire l'URL d'intégration
  const getIntegrationUrl = () => {
    if (!token) return "";
    const params = new URLSearchParams({
      token,
      user_id: user?.id || "",
      redirect_uri: `${appUrl}/auth/callback`
    });
    return `${appUrl}/auth/luvvix?${params.toString()}`;
  };
  
  const handleConnect = () => {
    const url = getIntegrationUrl();
    if (url) window.location.href = url;
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Intégrer LuvviX AI</CardTitle>
          <CardDescription>
            Connectez votre application LuvviX AI au système d'authentification LuvviX ID
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <p className="text-gray-700">
              Générez un token d'intégration pour connecter votre application externe
            </p>
          </div>
          
          <div className="ml-10">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="app-url">URL de votre application LuvviX AI</Label>
                <Input 
                  id="app-url" 
                  value={appUrl} 
                  onChange={(e) => setAppUrl(e.target.value)} 
                  placeholder="https://luvvix-ai.com"
                />
              </div>
              
              <Button 
                onClick={generateIntegrationToken} 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  "Générer un token d'intégration"
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
          
          {success && token && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <p className="text-gray-700">
                  Connectez-vous à votre application LuvviX AI
                </p>
              </div>
              
              <div className="ml-10 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="font-medium text-green-800">Token d'intégration généré</p>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Vous pouvez maintenant vous connecter à votre application LuvviX AI en utilisant ce token. Ce token sera valide pendant 1 heure.
                </p>
                
                <Button 
                  onClick={handleConnect} 
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Se connecter à LuvviX AI
                </Button>
              </div>
            </>
          )}
          
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-lg">Guide d'intégration pour les développeurs</h3>
            <p className="text-sm text-gray-600">
              Pour intégrer LuvviX AI avec LuvviX ID, vous devez implémenter le flux d'authentification OAuth suivant dans votre application:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Créez une route <code>/auth/luvvix</code> qui accepte un token LuvviX ID en paramètre</li>
                <li>Vérifiez la validité du token en appelant l'API LuvviX ID</li>
                <li>Créez ou récupérez le compte utilisateur correspondant dans votre système</li>
                <li>Établissez une session authentifiée dans votre système</li>
                <li>Redirigez l'utilisateur vers la page principale de votre application</li>
              </ol>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex-col space-y-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/ecosystem")}
          >
            Retour à l'écosystème
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LuvvixAIIntegrationPage;
