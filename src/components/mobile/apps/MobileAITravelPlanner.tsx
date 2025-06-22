
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Plane } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAITravelPlannerProps {
  onBack: () => void;
}

const MobileAITravelPlanner = ({ onBack }: MobileAITravelPlannerProps) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez un plan de voyage détaillé pour ${destination}, durée: ${duration}, budget: ${budget}. Incluez itinéraire, hébergements, activités et conseils pratiques.`
        }
      });
      
      if (error) throw error;
      setPlan(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Planificateur Voyage IA</h1>
        <Plane className="w-6 h-6 text-cyan-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Planifier votre voyage</h2>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Durée (ex: 1 semaine)..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget approximatif..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <button
            onClick={generatePlan}
            disabled={!destination.trim() || !duration.trim() || loading}
            className="w-full bg-cyan-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Planification...' : 'Créer plan de voyage'}
          </button>
        </div>
        
        {plan && (
          <div className="bg-cyan-50 rounded-2xl p-6">
            <h3 className="font-bold text-cyan-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Votre plan de voyage personnalisé
            </h3>
            <div className="text-cyan-700 whitespace-pre-wrap">{plan}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAITravelPlanner;
