
import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain } from "lucide-react";

interface WeatherWidgetProps {
  showLabel?: boolean;
}

const WeatherWidget = ({ showLabel = false }: WeatherWidgetProps) => {
  const [temp, setTemp] = useState<number | null>(null);
  const [weather, setWeather] = useState<string>('clear');
  
  useEffect(() => {
    // Simulation de météo - dans une application réelle, ceci serait une API météo
    const randomTemp = Math.floor(Math.random() * 15) + 15; // Entre 15 et 30°C
    setTemp(randomTemp);
    
    const weathers = ['clear', 'cloudy', 'rainy'];
    const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
    setWeather(randomWeather);
  }, []);

  const renderWeatherIcon = () => {
    switch(weather) {
      case 'clear':
        return <Sun className={showLabel ? "h-5 w-5 text-yellow-500" : "h-4 w-4 text-yellow-300"} />;
      case 'cloudy':
        return <Cloud className={showLabel ? "h-5 w-5 text-gray-400" : "h-4 w-4 text-gray-300"} />;
      case 'rainy':
        return <CloudRain className={showLabel ? "h-5 w-5 text-blue-400" : "h-4 w-4 text-blue-300"} />;
      default:
        return <Sun className={showLabel ? "h-5 w-5 text-yellow-500" : "h-4 w-4 text-yellow-300"} />;
    }
  };

  if (showLabel) {
    return (
      <div className="flex items-center space-x-2">
        {renderWeatherIcon()}
        <span className="font-medium">Météo locale</span>
        {temp !== null && (
          <span className="text-xl font-semibold">{temp}°C</span>
        )}
      </div>
    );
  }

  return (
    <div className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center">
      {renderWeatherIcon()}
      {temp !== null && (
        <span className="ml-1 text-xs">{temp}°C</span>
      )}
    </div>
  );
};

export default WeatherWidget;
