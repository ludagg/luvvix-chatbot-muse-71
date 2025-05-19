
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

const StatCards = () => {
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
          <div className="text-2xl font-bold">45%</div>
          <Progress value={45} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            2.3GB utilisés sur 5GB
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
          <div className="text-2xl font-bold">128</div>
          <Progress value={75} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            +23% ce mois-ci
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
          <div className="text-2xl font-bold">17h</div>
          <Progress value={85} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Temps total d'utilisation
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
