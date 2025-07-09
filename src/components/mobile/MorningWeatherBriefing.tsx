
import React, { useState, useEffect } from 'react';
import { useWeatherNotifications } from '@/hooks/useWeatherNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Cloud, CloudRain, Thermometer, X } from 'lucide-react';

interface WeatherBriefing {
  id: string;
  ai_briefing: string;
  weather_data: {
    temperature: number;
    condition: string;
    maxTemp: number;
    minTemp: number;
    humidity: number;
    precipitation: number;
  };
  sent_at: string;
}

const MorningWeatherBriefing = () => {
  const { loadMorningBriefing } = useWeatherNotifications();
  const { user } = useAuth();
  const [briefing, setBriefing] = useState<WeatherBriefing | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadBriefing = async () => {
      const morningBriefing = await loadMorningBriefing();
      if (morningBriefing) {
        setBriefing(morningBriefing);
        
        // Afficher seulement le matin (6h-11h)
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour <= 11) {
          setIsVisible(true);
        }
      }
    };

    loadBriefing();
  }, [user]);

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('pluie') || lowerCondition.includes('averse')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    }
    if (lowerCondition.includes('nuage')) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    }
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  if (!isVisible || !briefing) return null;

  return (
    <Card className="mx-4 mb-4 bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                🌅 Briefing du matin
              </Badge>
              <span className="text-xs text-gray-600">
                {new Date(briefing.sent_at).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              {getWeatherIcon(briefing.weather_data.condition)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {briefing.weather_data.temperature}°C
                  </span>
                  <span className="text-sm text-gray-600 capitalize">
                    {briefing.weather_data.condition}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {briefing.weather_data.minTemp}° / {briefing.weather_data.maxTemp}°
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-800 leading-relaxed">
              {briefing.ai_briefing}
            </p>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/50 rounded ml-2"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MorningWeatherBriefing;
