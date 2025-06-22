
import React, { useState } from 'react';
import { ArrowLeft, Heart, Smile, Sun } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIMentalHealthProps {
  onBack: () => void;
}

const MobileAIMentalHealth = ({ onBack }: MobileAIMentalHealthProps) => {
  const [mood, setMood] = useState('');
  const [situation, setSituation] = useState('');
  const [support, setSupport] = useState('');
  const [loading, setLoading] = useState(false);

  const getSupport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `En tant que thérapeute IA bienveillant, donnez du soutien pour cette situation: Humeur: ${mood}, Situation: ${situation}. Proposez des techniques de bien-être et d'apaisement.`
        }
      });
      
      if (error) throw error;
      setSupport(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Bien-être Mental IA</h1>
        <Heart className="w-6 h-6 text-blue-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Comment vous sentez-vous ?</h2>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="">Sélectionnez votre humeur</option>
            <option value="stressé">Stressé(e)</option>
            <option value="anxieux">Anxieux/se</option>
            <option value="triste">Triste</option>
            <option value="fatigué">Fatigué(e)</option>
            <option value="confus">Confus(e)</option>
            <option value="bien">Je vais bien</option>
          </select>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Décrivez votre situation (optionnel)..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <button
            onClick={getSupport}
            disabled={!mood || loading}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Analyse...' : 'Obtenir du soutien'}
          </button>
        </div>
        
        {support && (
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center">
              <Sun className="w-5 h-5 mr-2" />
              Conseils bien-être
            </h3>
            <div className="text-blue-700 whitespace-pre-wrap">{support}</div>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">💡 Ces conseils sont informatifs. Pour un soutien professionnel, consultez un thérapeute.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIMentalHealth;
