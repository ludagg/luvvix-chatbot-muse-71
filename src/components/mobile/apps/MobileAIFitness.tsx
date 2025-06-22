
import React, { useState } from 'react';
import { ArrowLeft, Dumbbell, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIFitnessProps {
  onBack: () => void;
}

const MobileAIFitness = ({ onBack }: MobileAIFitnessProps) => {
  const [goals, setGoals] = useState('');
  const [program, setProgram] = useState('');
  const [loading, setLoading] = useState(false);

  const generateProgram = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez un programme de fitness personnalisé détaillé pour ces objectifs: ${goals}. Incluez exercices, répétitions, et conseils nutritionnels.`
        }
      });
      
      if (error) throw error;
      setProgram(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Coach IA Fitness</h1>
        <Dumbbell className="w-6 h-6 text-orange-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Vos objectifs fitness</h2>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Décrivez vos objectifs (perte de poids, muscle, endurance...)"
            className="w-full h-24 p-4 border rounded-xl resize-none"
          />
          <button
            onClick={generateProgram}
            disabled={!goals.trim() || loading}
            className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Génération...' : 'Créer programme'}
          </button>
        </div>
        
        {program && (
          <div className="bg-orange-50 rounded-2xl p-6">
            <h3 className="font-bold text-orange-800 mb-4">Votre programme personnalisé</h3>
            <div className="text-orange-700 whitespace-pre-wrap">{program}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIFitness;
