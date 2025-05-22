
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCrossAppAuth } from "@/hooks/use-cross-app-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIIntegrationProps {
  redirectUrl?: string;
}

export const AIIntegration = ({ redirectUrl = "https://ai.luvvix.it.com/auth/callback" }: AIIntegrationProps) => {
  const { user } = useAuth();
  const { getAppToken, isAuthenticated } = useCrossAppAuth({ 
    appName: 'main', 
    autoInit: true 
  });
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [aiToken, setAiToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Fonction pour générer un token d'accès à LuvviX AI
  const generateAIToken = async () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Non connecté",
        description: "Vous devez être connecté à LuvviX ID pour accéder à LuvviX AI",
      });
      return;
    }

    setIsGeneratingToken(true);
    
    try {
      // Utiliser le système cross-app pour obtenir un token
      const token = await getAppToken();
      
      if (!token) {
        throw new Error("Impossible d'obtenir un token d'accès");
      }
      
      setAiToken(token);
      
      // Préparer la redirection avec le token
      const aiRedirectUrl = new URL(redirectUrl);
      aiRedirectUrl.searchParams.append("token", token);
      
      if (user) {
        aiRedirectUrl.searchParams.append("user_id", user.id);
        aiRedirectUrl.searchParams.append("email", user.email || '');
      }
      
      // Rediriger l'utilisateur vers LuvviX AI
      window.location.href = aiRedirectUrl.toString();
      
    } catch (error) {
      console.error("Erreur lors de la génération du token:", error);
      toast({
        variant: "destructive",
        title: "Échec de l'authentification",
        description: "Une erreur est survenue lors de la connexion à LuvviX AI.",
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connexion à LuvviX AI</CardTitle>
        <CardDescription>
          Utilisez votre compte LuvviX ID pour accéder à LuvviX AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="text-center">
            <p className="mb-4">
              Vous êtes connecté en tant que <strong>{user?.email}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Cliquez sur le bouton ci-dessous pour vous connecter à LuvviX AI avec votre compte LuvviX ID actuel.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-amber-600">
              Vous n'êtes pas connecté à LuvviX ID.
            </p>
            <p className="text-sm text-gray-500">
              Veuillez vous connecter à LuvviX ID pour accéder à LuvviX AI.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {isAuthenticated ? (
          <Button 
            className="w-full" 
            onClick={generateAIToken} 
            disabled={isGeneratingToken}
          >
            {isGeneratingToken ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Se connecter à LuvviX AI
              </>
            )}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => window.location.href = "/auth"}
          >
            Se connecter à LuvviX ID
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIIntegration;
