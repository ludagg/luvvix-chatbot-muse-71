
import React from "react";
import { 
  Image, 
  MessageSquareText, 
  Zap, 
  Clock, 
  DownloadCloud,
  Crown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ProFeatures = () => {
  const features = [
    {
      icon: <Image className="h-5 w-5 text-amber-500" />,
      title: "Envoi d'images",
      description: "Envoyez des images pour analyse et reconnaissance par l'IA"
    },
    {
      icon: <MessageSquareText className="h-5 w-5 text-amber-500" />,
      title: "Réponses plus détaillées",
      description: "Obtenez des réponses plus longues et plus détaillées !"
    },
    {
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      title: "Priorité dans la file d'attente",
      description: "Vos requêtes sont traitées en priorité"
    },
    {
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      title: "Conversations plus longues",
      description: "Stockez plus de conversations et pour plus longtemps"
    },
    {
      icon: <DownloadCloud className="h-5 w-5 text-amber-500" />,
      title: "Export de données",
      description: "Exportez vos conversations en différents formats"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Crown className="h-6 w-6 text-amber-500 fill-amber-500" />
        <h2 className="text-xl font-semibold text-center">Fonctionnalités Pro</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card">
            <div className="mt-0.5">{feature.icon}</div>
            <div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
