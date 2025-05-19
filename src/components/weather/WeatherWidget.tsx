import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Cloud, 
  CloudSun, 
  CloudDrizzle, 
  CloudSnow, 
  CloudLightning,
  Compass,
  MapPin 
} from "lucide-react";
import { getUserLocation } from "@/services/news-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  sunrise: string; // Changed type from number to string
  sunset: string;  // Changed type from number to string
  forecast?: ForecastDay[];
}

interface ForecastDay {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailed, setShowDetailed] = useState(false);

  // Free WeatherAPI.com API key (for demo purposes)
  const API_KEY = "b91e7e5ad18e4387aec74107232408";

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
        
        // Use WeatherAPI.com for current weather data (free tier)
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${locationData.latitude},${locationData.longitude}&days=3&lang=fr&aqi=no`
        );
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données météo");
        }
        
        const data = await response.json();
        
        // Transform data into our format
        const forecastDays = data.forecast.forecastday.map((day: any) => ({
          date: new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
          minTemp: Math.round(day.day.mintemp_c),
          maxTemp: Math.round(day.day.maxtemp_c),
          condition: day.day.condition.text.toLowerCase(),
          icon: day.day.condition.icon
        }));
        
        setWeather({
          temperature: Math.round(data.current.temp_c),
          feelsLike: Math.round(data.current.feelslike_c),
          condition: data.current.condition.text.toLowerCase(),
          icon: data.current.condition.icon,
          location: data.location.name,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          windDirection: data.current.wind_degree,
          pressure: data.current.pressure_mb,
          visibility: data.current.vis_km,
          sunrise: data.forecast.forecastday[0].astro.sunrise, // This is a string value
          sunset: data.forecast.forecastday[0].astro.sunset,   // This is a string value
          forecast: forecastDays
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
            feelsLike: 24,
            condition: 'ciel dégagé',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            location: 'Douala',
            humidity: 65,
            windSpeed: 13,
            windDirection: 180,
            pressure: 1013,
            visibility: 10,
            sunrise: '06:32', // String value
            sunset: '18:44',  // String value
            forecast: [
              {
                date: 'Demain',
                minTemp: 20,
                maxTemp: 25,
                condition: 'ciel dégagé',
                icon: '//cdn.weatherapi.com/weather/64x64/day/113.png'
              },
              {
                date: 'Mer.',
                minTemp: 21,
                maxTemp: 26,
                condition: 'quelques nuages',
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
              },
              {
                date: 'Jeu.',
                minTemp: 19,
                maxTemp: 24,
                condition: 'couvert',
                icon: '//cdn.weatherapi.com/weather/64x64/day/119.png'
              }
            ]
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
      if (data.current.temp_c > 35) {
        new Notification("Alerte Météo", {
          body: `Canicule: ${Math.round(data.current.temp_c)}°C à ${data.location.name}. Restez hydraté !`,
          icon: "/weather-icons/hot.png"
        });
        
        toast({
          title: "Alerte Météo",
          description: `Canicule: ${Math.round(data.current.temp_c)}°C à ${data.location.name}. Restez hydraté !`,
          variant: "destructive",
        });
      } else if (data.current.temp_c < 0) {
        new Notification("Alerte Météo", {
          body: `Gel: ${Math.round(data.current.temp_c)}°C à ${data.location.name}. Couvrez-vous !`,
          icon: "/weather-icons/cold.png"
        });
        
        toast({
          title: "Alerte Météo",
          description: `Gel: ${Math.round(data.current.temp_c)}°C à ${data.location.name}. Couvrez-vous !`,
        });
      } else if (data.current.condition.text.includes("Thunder")) {
        new Notification("Alerte Météo", {
          body: `Orages à ${data.location.name}. Restez prudent !`,
          icon: "/weather-icons/storm.png"
        });
        
        toast({
          title: "Alerte Météo",
          description: `Orages à ${data.location.name}. Restez prudent !`,
        });
      } else if (data.current.wind_kph > 50) {
        new Notification("Alerte Météo", {
          body: `Vents violents à ${data.location.name} (${data.current.wind_kph} km/h).`,
          icon: "/weather-icons/wind.png"
        });
        
        toast({
          title: "Alerte Météo",
          description: `Vents violents à ${data.location.name} (${data.current.wind_kph} km/h).`,
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
    } else {
      // Toggle detailed view if we already have permissions
      setShowDetailed(!showDetailed);
    }
  };
  
  // Format wind direction
  const formatWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };
  
  // Choose weather icon based on condition or use API provided icon
  const renderWeatherIcon = (condition: string, size: number = 5) => {
    if (condition.includes("pluie") || condition.includes("averse")) {
      return <CloudRain className={`w-${size} h-${size}`} />;
    } else if (condition.includes("nuage")) {
      return <CloudSun className={`w-${size} h-${size}`} />;
    } else if (condition.includes("brume") || condition.includes("brouillard")) {
      return <Cloud className={`w-${size} h-${size} text-gray-400`} />;
    } else if (condition.includes("bruine")) {
      return <CloudDrizzle className={`w-${size} h-${size}`} />;
    } else if (condition.includes("neige")) {
      return <CloudSnow className={`w-${size} h-${size} text-blue-200`} />;
    } else if (condition.includes("orage")) {
      return <CloudLightning className={`w-${size} h-${size} text-yellow-400`} />;
    } else if (condition.includes("vent")) {
      return <Wind className={`w-${size} h-${size}`} />;
    } else {
      return <Sun className={`w-${size} h-${size} text-yellow-400`} />;
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
  
  if (showDetailed && weather) {
    return (
      <Card className="fixed top-20 right-4 z-50 p-4 w-80 shadow-lg animate-in fade-in-0 slide-in-from-top-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {weather.icon && weather.icon.startsWith('http') ? (
              <img src={weather.icon} width="40" height="40" alt={weather.condition} />
            ) : (
              renderWeatherIcon(weather.condition)
            )}
            <div>
              <h3 className="font-medium text-lg">{weather.location}</h3>
              <p className="text-sm text-muted-foreground capitalize">{weather.condition}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowDetailed(false)} className="h-8 w-8 p-0">
            ×
          </Button>
        </div>
        
        <div className="mt-3 text-center">
          <div className="text-4xl font-bold">{weather.temperature}°C</div>
          <div className="text-sm text-muted-foreground">
            Ressenti {weather.feelsLike}°C
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Humidité: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4" />
            <span className="text-sm">{weather.windSpeed} km/h {formatWindDirection(weather.windDirection)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            <span className="text-sm">Pression: {weather.pressure} hPa</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4" />
            <span className="text-sm">Visibilité: {weather.visibility} km</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Sun className="w-3 h-3 text-yellow-400 mr-1" />
            Lever: {weather.sunrise}
          </div>
          <div className="flex items-center">
            <Sun className="w-3 h-3 text-orange-400 mr-1" />
            Coucher: {weather.sunset}
          </div>
        </div>
        
        {weather.forecast && weather.forecast.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="flex justify-between">
              {weather.forecast.map((day, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-medium">{day.date}</div>
                  <div className="my-1">
                    {day.icon && day.icon.startsWith('http') ? (
                      <img src={day.icon} width="32" height="32" alt={day.condition} />
                    ) : (
                      renderWeatherIcon(day.condition, 4)
                    )}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">{day.maxTemp}°</span>
                    <span className="text-muted-foreground"> {day.minTemp}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="mt-3 text-xs text-center text-muted-foreground">
          <MapPin className="w-3 h-3 inline mr-1" />
          Données météo localisées pour votre position
        </div>
      </Card>
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
            {weather ? (
              weather.icon && weather.icon.startsWith('http') ? (
                <img src={weather.icon} width="24" height="24" alt={weather.condition} className="mr-1" />
              ) : renderWeatherIcon(weather.condition)
            ) : (
              <Thermometer className="w-5 h-5" />
            )}
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
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Lever: {weather?.sunrise}</span>
              <span>Coucher: {weather?.sunset}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {Notification.permission === "granted"
                ? "Cliquez pour afficher les détails"
                : "Cliquez pour activer les notifications météo"}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default WeatherWidget;
