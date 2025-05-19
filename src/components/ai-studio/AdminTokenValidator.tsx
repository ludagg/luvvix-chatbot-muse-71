
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface AdminTokenValidatorProps {
  onValidToken: (token: string) => void;
}

// Token administrateur pour accès
const ADMIN_SECRET = "luvvix-id-admin-secret-token";

const AdminTokenValidator = ({ onValidToken }: AdminTokenValidatorProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      if (urlToken === ADMIN_SECRET) {
        onValidToken(urlToken);
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [searchParams, onValidToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (token === ADMIN_SECRET) {
      onValidToken(token);
      // Mettre à jour l'URL avec le token pour les rechargements de page
      navigate(`?token=${token}`);
    } else {
      setError(true);
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Le token administrateur n'est pas valide."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accès administrateur</CardTitle>
          <CardDescription>
            Veuillez saisir le token administrateur pour accéder aux paramètres.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token administrateur</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="Entrez le token administrateur"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className={error ? "border-red-500" : ""}
                />
                {error && (
                  <p className="text-sm text-red-500">Token administrateur invalide</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/ai-studio")}>
              Retour
            </Button>
            <Button type="submit">Accéder</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminTokenValidator;
