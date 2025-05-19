
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sun, CloudRain, Wind, Thermometer, Cloud, CloudSun, CloudDrizzle } from "lucide-react";
import { getUserLocation } from "@/services/news-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Free OpenWeatherMap API key (for demo purposes)
  const API_KEY = "3b7ae57a234b7e6279287af79efeb36c";

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Get user location using the existing function
        const locationData = await getUserLocation();
        
        if (!locationData || !locationData.latitude || !locationData.longitude) {
          setError("Impossible de déterminer votre localisation");
          setLoading(false);
          return;
        }
        
        // Use OpenWeatherMap API (free tier) to get weather data
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&units=metric&lang=fr&appid=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données météo");
        }
        
        const data = await response.json();
        
        // Transform data into our format
        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          icon: data.weather[0].icon,
          location: data.name,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        });
        
        // Check for extreme weather conditions and send notifications if needed
        checkExtremeWeather(data);
      } catch (err) {
        console.error("Erreur météo:", err);
        setError("Erreur lors du chargement de la météo");
        
        // Set fallback data for development/testing
        if (process.env.NODE_ENV === 'development') {
          setWeather({
            temperature: 22,
            condition: 'ciel dégagé',
            icon: '01d',
            location: 'Douala',
            humidity: 65,
            windSpeed: 3.5,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to check for extreme weather and send notifications
  const checkExtremeWeather = (data: any) => {
    // Check if notifications are supported and permission is granted
    if (!("Notification" in window)) {
      return;
    }
    
    // Check for permission
    if (Notification.permission === "granted") {
      // Check for extreme weather conditions
      if (data.main.temp > 35) {
        new Notification("Alerte Météo", {
          body: `Canicule: ${Math.round(data.main.temp)}°C à ${data.name}. Restez hydraté !`,
          icon: "/weather-icons/hot.png"
        });
      } else if (data.main.temp < 0) {
        new Notification("Alerte Météo", {
          body: `Gel: ${Math.round(data.main.temp)}°C à ${data.name}. Couvrez-vous !`,
          icon: "/weather-icons/cold.png"
        });
      } else if (data.weather[0].main === "Thunderstorm") {
        new Notification("Alerte Météo", {
          body: `Orages à ${data.name}. Restez prudent !`,
          icon: "/weather-icons/storm.png"
        });
      } else if (data.wind.speed > 20) {
        new Notification("Alerte Météo", {
          body: `Vents violents à ${data.name} (${data.wind.speed} km/h).`,
          icon: "/weather-icons/wind.png"
        });
      }
    }
  };
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Erreur",
        description: "Votre navigateur ne supporte pas les notifications.",
        variant: "destructive",
      });
      return;
    }
    
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des alertes pour les événements météo importants.",
        });
        
        // Send a test notification
        new Notification("LuvviX Météo", {
          body: "Les notifications sont maintenant activées !",
        });
      }
    }
  };
  
  // Choose weather icon based on condition
  const renderWeatherIcon = () => {
    if (!weather) return <Thermometer className="w-5 h-5" />;
    
    if (weather.condition.includes("pluie") || weather.condition.includes("averse")) {
      return <CloudRain className="w-5 h-5" />;
    } else if (weather.condition.includes("nuage")) {
      return <CloudSun className="w-5 h-5" />;
    } else if (weather.condition.includes("brume") || weather.condition.includes("brouillard")) {
      return <Cloud className="w-5 h-5 text-gray-400" />;
    } else if (weather.condition.includes("bruine")) {
      return <CloudDrizzle className="w-5 h-5" />;
    } else if (weather.condition.includes("vent")) {
      return <Wind className="w-5 h-5" />;
    } else {
      return <Sun className="w-5 h-5 text-yellow-400" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }
  
  if (error && !weather) {
    return (
      <Button variant="ghost" size="sm" onClick={requestNotificationPermission}>
        <Thermometer className="w-5 h-5 text-gray-400" />
      </Button>
    );
  }
  
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10" 
            onClick={requestNotificationPermission}
          >
            {renderWeatherIcon()}
            <span className="font-medium">{weather?.temperature}°C</span>
            <Badge variant="outline" className="ml-1 text-xs py-0 px-1.5 border-white/20">
              {weather?.location}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-4 max-w-[16rem]">
          <div className="space-y-2">
            <div className="font-medium">{weather?.location}</div>
            <div className="capitalize">{weather?.condition}</div>
            <div className="text-sm text-muted-foreground">
              Humidité: {weather?.humidity}% • Vent: {weather?.windSpeed} km/h
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Cliquez pour activer les notifications météo
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default WeatherWidget;
