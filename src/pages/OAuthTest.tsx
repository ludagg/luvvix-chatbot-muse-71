
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Code2, Loader2 } from "lucide-react";

const OAuthTest = () => {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTest = () => {
    if (!clientId || !redirectUri) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs"
      });
      return;
    }

    // Construction de l'URL OAuth
    const oauthUrl = new URL("/oauth/authorize", window.location.origin);
    oauthUrl.searchParams.append("client_id", clientId);
    oauthUrl.searchParams.append("redirect_uri", redirectUri);
    oauthUrl.searchParams.append("scope", "profile");
    oauthUrl.searchParams.append("state", "test-state-" + Date.now());

    // Redirection vers la page d'autorisation
    window.location.href = oauthUrl.toString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Test OAuth</h1>
            <p className="mt-2 text-gray-600">
              Cette page permet de tester le flux OAuth de LuvviX ID manuellement.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configuration OAuth</CardTitle>
              <CardDescription>
                Entrez les informations de votre application pour tester le flux OAuth.
                Vous pouvez créer une nouvelle application dans la section Admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Votre Client ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="redirectUri">URI de redirection</Label>
                <Input
                  id="redirectUri"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  placeholder="https://votre-app.com/callback"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleTest} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  "Tester le flux OAuth"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Exemple de code
              </CardTitle>
              <CardDescription>
                Voici un exemple de code pour implémenter le flux OAuth dans votre application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">
{`// 1. Rediriger l'utilisateur vers LuvviX ID
const oauthUrl = new URL("${window.location.origin}/oauth/authorize");
oauthUrl.searchParams.append("client_id", "VOTRE_CLIENT_ID");
oauthUrl.searchParams.append("redirect_uri", "VOTRE_URI_REDIRECT");
oauthUrl.searchParams.append("scope", "profile");
oauthUrl.searchParams.append("state", "ETAT_ALEATOIRE");

// 2. L'utilisateur sera redirigé vers votre URI avec un token
// Exemple de code dans votre page de callback :
const token = new URLSearchParams(window.location.search).get("token");
if (token) {
  // 3. Utiliser le token pour accéder à l'API LuvviX ID
  const response = await fetch("${window.location.origin}/api/user", {
    headers: {
      "Authorization": \`Bearer \${token}\`
    }
  });
  const userData = await response.json();
}`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OAuthTest;
