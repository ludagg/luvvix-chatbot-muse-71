
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { subscribeToNewsTopics, getCurrentUserSubscription } from "@/services/news-service";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { NewsletterStatus } from "./NewsletterStatus";
import { getCurrentUser } from "@/services/auth-utils";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'realtime'>('daily');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const { toast } = useToast();

  const availableTopics = [
    "Intelligence Artificielle",
    "Changement Climatique",
    "Cybersécurité",
    "Blockchain",
    "Spatial",
    "Économie",
    "Politique",
    "Santé",
  ];

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      try {
        const user = await getCurrentUser();
        setIsLoggedIn(!!user);

        if (user) {
          const subscription = await getCurrentUserSubscription();
          setHasSubscription(!!subscription);
          
          if (subscription) {
            // Pré-remplir les champs avec les données existantes
            setEmail(subscription.email || user.email || "");
            setTopics(subscription.topics || []);
            setFrequency(subscription.preferences?.frequency || 'daily');
          } else if (user.email) {
            setEmail(user.email);
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuthAndSubscription();
  }, [isSubmitted]);

  const handleCheckboxChange = (topic: string) => {
    setTopics((prevTopics) => {
      if (prevTopics.includes(topic)) {
        return prevTopics.filter((t) => t !== topic);
      } else {
        return [...prevTopics, topic];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour vous abonner à la newsletter",
        variant: "destructive",
      });
      return;
    }

    if (topics.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un sujet d'intérêt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await subscribeToNewsTopics(
        topics, 
        email,
        { frequency, categories: [], location: false }
      );

      if (success) {
        setIsSubmitted(true);
        toast({
          title: "Abonnement réussi",
          description: "Vous êtes maintenant abonné à notre newsletter",
        });
      } else {
        throw new Error("Échec de l'abonnement");
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'abonnement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restez informé</CardTitle>
          <CardDescription>
            Abonnez-vous à notre newsletter pour recevoir les dernières actualités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Veuillez vous connecter pour vous abonner à notre newsletter
          </p>
          <Button className="w-full" onClick={() => window.location.href = "/auth"}>
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasSubscription) {
    return <NewsletterStatus />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restez informé</CardTitle>
        <CardDescription>
          Abonnez-vous à notre newsletter pour recevoir les dernières actualités
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Fréquence d'envoi</Label>
            <RadioGroup value={frequency} onValueChange={(val) => setFrequency(val as 'daily' | 'weekly' | 'realtime')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Quotidienne</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Hebdomadaire</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="realtime" id="realtime" />
                <Label htmlFor="realtime">Temps réel</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Sujets d'intérêt</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableTopics.map((topic) => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox
                    id={`topic-${topic}`}
                    checked={topics.includes(topic)}
                    onCheckedChange={() => handleCheckboxChange(topic)}
                  />
                  <Label htmlFor={`topic-${topic}`}>{topic}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              "S'abonner"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
