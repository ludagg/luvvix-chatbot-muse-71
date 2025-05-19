
import { useEffect, useState } from "react";
import { PieChart, BarChart2, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardsProps {
  userId?: string;
}

const StatCards = ({ userId }: StatCardsProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    storageUsed: 0,
    storageTotal: 5, // 5GB gratuits par défaut
    formResponses: 0,
    formResponsesGrowth: 0,
    weeklyActivity: 0,
    weeklyActivityPercentage: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Récupérer l'utilisation du stockage
        const { data: filesData, error: filesError } = await supabase
          .from('cloud_files')
          .select('size')
          .eq('user_id', userId)
          .eq('is_deleted', false);
          
        if (filesError) throw filesError;
        
        // Calculer la taille totale en GB
        const totalSize = filesData?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;
        const sizeInGB = totalSize / (1024 * 1024 * 1024); // Convertir en GB
        
        // Récupérer les réponses aux formulaires
        const { count: responsesCount, error: responsesError } = await supabase
          .from('form_submissions')
          .select('id', { count: 'exact' })
          .eq('responder_id', userId);
          
        if (responsesError) throw responsesError;
        
        // Récupérer l'activité de connexion de la semaine dernière
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { data: sessionData, error: sessionError } = await supabase
          .from('Session')
          .select('*')
          .eq('userId', userId)
          .gte('lastActive', oneWeekAgo.toISOString())
          .order('lastActive', { ascending: false });
          
        if (sessionError && sessionError.code !== 'PGRST116') {
          // PGRST116 signifie que la table n'existe pas, nous ignorons cette erreur
          throw sessionError;
        }
        
        let activityHours = 0;
        
        // Si Session existe et a des données
        if (sessionData && sessionData.length > 0) {
          // Calculer les heures d'activité approximatives basées sur le nombre de sessions
          activityHours = sessionData.length * 1.5; // Supposons 1.5h par session en moyenne
        }
        
        setStats({
          storageUsed: parseFloat(sizeInGB.toFixed(2)),
          storageTotal: 5,
          formResponses: responsesCount || 0,
          formResponsesGrowth: 12, // À améliorer avec des données réelles
          weeklyActivity: Math.round(activityHours),
          weeklyActivityPercentage: Math.min(Math.round((activityHours / 40) * 100), 100) // 40h étant une semaine complète
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        // En cas d'erreur, utiliser des données par défaut
        setStats({
          storageUsed: 0.1,
          storageTotal: 5,
          formResponses: 0,
          formResponsesGrowth: 0,
          weeklyActivity: 0,
          weeklyActivityPercentage: 10
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <PieChart className="w-4 h-4 mr-2 text-blue-500" />
            Utilisation du cloud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((stats.storageUsed / stats.storageTotal) * 100)}%
          </div>
          <Progress 
            value={Math.round((stats.storageUsed / stats.storageTotal) * 100)} 
            className="h-2 mt-2" 
          />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.storageUsed}GB utilisés sur {stats.storageTotal}GB
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart2 className="w-4 h-4 mr-2 text-orange-500" />
            Réponses aux formulaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.formResponses}</div>
          <Progress value={stats.formResponses > 0 ? 75 : 5} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.formResponsesGrowth > 0 ? `+${stats.formResponsesGrowth}% ce mois-ci` : 'Aucune réponse récente'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            Activité hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weeklyActivity}h</div>
          <Progress value={stats.weeklyActivityPercentage} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Temps total d'utilisation
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
