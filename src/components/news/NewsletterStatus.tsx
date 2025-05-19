
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { getCurrentUserSubscription, unsubscribeFromNewsletter } from "@/services/news-service";
import { NewsSubscription } from "@/types/news";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export const NewsletterStatus = () => {
  const [subscription, setSubscription] = useState<NewsSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await getCurrentUserSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer votre statut d'abonnement",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [toast]);

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true);
      const success = await unsubscribeFromNewsletter();
      
      if (success) {
        setSubscription(null);
        toast({
          title: "Désabonnement réussi",
          description: "Vous avez été désabonné de la newsletter avec succès",
        });
      } else {
        throw new Error("Échec du désabonnement");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vous désabonner de la newsletter",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre abonnement à la newsletter</CardTitle>
        <CardDescription>
          Gérez vos préférences d'abonnement à la newsletter LuvviX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Email:</span>
            <span>{subscription.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Fréquence:</span>
            <Badge variant="outline" className="capitalize">
              {subscription.preferences?.frequency === 'daily' ? 'Quotidienne' : 
               subscription.preferences?.frequency === 'weekly' ? 'Hebdomadaire' : 
               subscription.preferences?.frequency === 'realtime' ? 'Temps réel' : 'Non définie'}
            </Badge>
          </div>
          
          <div>
            <span className="font-medium">Sujets d'intérêt:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {subscription.topics && subscription.topics.length > 0 ? (
                subscription.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Aucun sujet sélectionné</span>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          onClick={handleUnsubscribe}
          disabled={isLoading}
          className="w-full mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            "Se désabonner de la newsletter"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
