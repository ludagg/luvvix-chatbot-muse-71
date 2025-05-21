
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Timer, Calendar, Activity } from "lucide-react";

const UsageStats = ({ userId }: { userId: string }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(new Date());
  const [sessionTime, setSessionTime] = useState('0m');
  
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Calculate session time
      const diff = Math.floor((new Date().getTime() - sessionStart.getTime()) / 1000);
      if (diff < 60) {
        setSessionTime(`${diff}s`);
      } else if (diff < 3600) {
        setSessionTime(`${Math.floor(diff / 60)}m ${diff % 60}s`);
      } else {
        setSessionTime(`${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`);
      }
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, [sessionStart]);
  
  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const formattedDate = currentTime.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Simulate usage data - in a real app this would be fetched from an API
  const weeklyUsage = {
    monday: Math.floor(Math.random() * 120),
    tuesday: Math.floor(Math.random() * 120),
    wednesday: Math.floor(Math.random() * 120),
    thursday: Math.floor(Math.random() * 120),
    friday: Math.floor(Math.random() * 120),
    saturday: Math.floor(Math.random() * 60),
    sunday: Math.floor(Math.random() * 30),
  };
  
  const totalWeeklyUsage = Object.values(weeklyUsage).reduce((acc, curr) => acc + curr, 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            Heure locale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedTime}</div>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Timer className="w-4 h-4 mr-2 text-green-500" />
            Temps de session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sessionTime}</div>
          <p className="text-sm text-gray-500">Depuis votre connexion</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="w-4 h-4 mr-2 text-purple-500" />
            Utilisation hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWeeklyUsage} min</div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            {Object.values(weeklyUsage).map((value, index) => (
              <div
                key={index}
                className={`h-2 rounded-l-full ${
                  ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 
                   'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 
                   'bg-indigo-500'][index]
                }`}
                style={{ 
                  width: `${(value / totalWeeklyUsage) * 100}%`, 
                  display: 'inline-block',
                  borderRadius: index === 0 ? '9999px 0 0 9999px' : 
                              index === 6 ? '0 9999px 9999px 0' : '0'
                }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">L M M J V S D</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageStats;
