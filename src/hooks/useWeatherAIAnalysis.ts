
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { WeatherData } from "./use-weather";

export function useWeatherAIAnalysis() {
  const [aiAnalysis, setAIAnalysis] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  const generateAIAnalysis = async (weatherData: WeatherData | null) => {
    if (!weatherData) return;
    setLoadingAI(true);
    setAIAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke("luvvix-weather-api", {
        body: {
          action: "analyzeWeather",
          weatherData,
          location: weatherData.location?.name,
        },
      });
      if (error) throw error;
      setAIAnalysis(data.analysis || "Aucune analyse IA disponible.");
    } catch (e: any) {
      setAIAnalysis("");
      toast({
        title: "Erreur (IA météo)",
        description: "L'analyse météo n'a pas pu être obtenue.",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return { aiAnalysis, loadingAI, generateAIAnalysis };
}
