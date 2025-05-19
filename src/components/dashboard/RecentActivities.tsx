
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarDays } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: Date;
  app: string;
}

// Données fictives pour la démonstration
const activities: Activity[] = [
  {
    id: "1",
    title: "Formulaire créé",
    description: "Vous avez créé un nouveau formulaire 'Sondage client'",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    app: "LuvviX Forms"
  },
  {
    id: "2",
    title: "Discussion avec l'IA",
    description: "Vous avez eu une conversation avec LuvviX AI",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    app: "LuvviX AI"
  },
  {
    id: "3",
    title: "Fichier téléchargé",
    description: "Document.pdf a été téléchargé sur votre cloud",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    app: "LuvviX Cloud"
  }
];

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Il y a quelques secondes";
  } else if (diffInSeconds < 3600) {
    return `Il y a ${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    return `Il y a ${Math.floor(diffInSeconds / 3600)} heure${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''}`;
  } else {
    return `${date.toLocaleDateString('fr-FR')}`;
  }
};

const RecentActivities = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Activités récentes
        </CardTitle>
        <CardDescription>
          Vos dernières actions dans l'écosystème LuvviX
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                <CalendarDays className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-medium">{activity.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-purple-600">{activity.app}</span>
                  <span className="text-xs text-gray-400">{formatRelativeTime(activity.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
