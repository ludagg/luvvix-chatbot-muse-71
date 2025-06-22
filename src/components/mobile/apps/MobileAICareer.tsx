
import React, { useState } from 'react';
import { ArrowLeft, Briefcase, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAICareerProps {
  onBack: () => void;
}

const MobileAICareer = ({ onBack }: MobileAICareerProps) => {
  const [skills, setSkills] = useState('');
  const [goals, setGoals] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getCareerAdvice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Donnez des conseils de carrière personnalisés. Compétences: ${skills}. Objectifs: ${goals}. Incluez plan de développement et opportunités.`
        }
      });
      
      if (error) throw error;
      setAdvice(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-violet-50 to-purple-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Conseiller Carrière IA</h1>
        <Briefcase className="w-6 h-6 text-violet-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Profil professionnel</h2>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Vos compétences actuelles..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Vos objectifs de carrière..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <button
            onClick={getCareerAdvice}
            disabled={!skills.trim() || !goals.trim() || loading}
            className="w-full bg-violet-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Analyse...' : 'Obtenir conseils'}
          </button>
        </div>
        
        {advice && (
          <div className="bg-violet-50 rounded-2xl p-6">
            <h3 className="font-bold text-violet-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Plan de carrière personnalisé
            </h3>
            <div className="text-violet-700 whitespace-pre-wrap">{advice}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAICareer;
