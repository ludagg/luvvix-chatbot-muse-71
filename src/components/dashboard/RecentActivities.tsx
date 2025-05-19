
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: Date;
  app: string;
}

interface RecentActivitiesProps {
  userId?: string;
}

const RecentActivities = ({ userId }: RecentActivitiesProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Récupérer les formulaires créés récemment
        const { data: formsData, error: formsError } = await supabase
          .from('forms')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (formsError) throw formsError;
        
        // Récupérer les fichiers téléchargés récemment
        const { data: filesData, error: filesError } = await supabase
          .from('cloud_files')
          .select('id, name, created_at')
          .eq('user_id', userId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (filesError) throw filesError;
        
        // Récupérer les sessions récentes
        const { data: sessionData, error: sessionError } = await supabase
          .from('Session')
          .select('id, createdAt')
          .eq('userId', userId)
          .order('createdAt', { ascending: false })
          .limit(3);
          
        if (sessionError && sessionError.code !== 'PGRST116') {
          // PGRST116 signifie que la table n'existe pas, nous ignorons cette erreur
          throw sessionError;
        }
        
        // Combiner et formater les activités
        let combinedActivities: Activity[] = [];
        
        // Ajouter les formulaires
        if (formsData) {
          const formActivities = formsData.map(form => ({
            id: `form-${form.id}`,
            title: "Formulaire créé",
            description: `Vous avez créé le formulaire "${form.title}"`,
            date: new Date(form.created_at),
            app: "LuvviX Forms"
          }));
          combinedActivities = [...combinedActivities, ...formActivities];
        }
        
        // Ajouter les fichiers
        if (filesData) {
          const fileActivities = filesData.map(file => ({
            id: `file-${file.id}`,
            title: "Fichier téléchargé",
            description: `"${file.name}" a été téléchargé sur votre cloud`,
            date: new Date(file.created_at),
            app: "LuvviX Cloud"
          }));
          combinedActivities = [...combinedActivities, ...fileActivities];
        }
        
        // Ajouter les sessions
        if (sessionData) {
          const sessionActivities = sessionData.map(session => ({
            id: `session-${session.id}`,
            title: "Connexion",
            description: "Vous vous êtes connecté à votre compte LuvviX",
            date: new Date(session.createdAt),
            app: "LuvviX ID"
          }));
          combinedActivities = [...combinedActivities, ...sessionActivities];
        }
        
        // Trier par date décroissante
        combinedActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        // Limiter à 5 activités
        setActivities(combinedActivities.slice(0, 5));
      } catch (error) {
        console.error("Erreur lors de la récupération des activités:", error);
        // En cas d'erreur, utiliser des données fictives pour la démonstration
        setActivities([
          {
            id: "fallback-1",
            title: "Dernière activité",
            description: "Impossible de récupérer vos activités récentes",
            date: new Date(),
            app: "LuvviX"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId]);
  
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

  if (loading) {
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
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-3 rounded-lg border border-gray-100">
                <div className="flex-shrink-0 mt-1">
                  <Skeleton className="w-5 h-5 rounded-full" />
                </div>
                <div className="flex-grow">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {activities.length > 0 ? (
            activities.map(activity => (
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
            ))
          ) : (
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <p className="text-gray-500">Aucune activité récente</p>
              <p className="text-sm text-gray-400 mt-2">
                Vos activités apparaîtront ici au fur et à mesure de votre utilisation
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
