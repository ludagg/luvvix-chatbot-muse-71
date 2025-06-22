
import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Camera, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIDoctorProps {
  onBack: () => void;
}

const MobileAIDoctor = ({ onBack }: MobileAIDoctorProps) => {
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const analyzSymptoms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `En tant que médecin IA, analysez ces symptômes et donnez des conseils médicaux généraux (rappel: consultez un vrai médecin pour un diagnostic précis): ${symptoms}`
        }
      });
      
      if (error) throw error;
      setDiagnosis(data.response);
      setHistory(prev => [...prev, { symptoms, diagnosis: data.response, date: new Date() }]);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Dr. LuvviX IA</h1>
        <Heart className="w-6 h-6 text-red-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Décrivez vos symptômes</h2>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Décrivez vos symptômes en détail..."
            className="w-full h-32 p-4 border rounded-xl resize-none"
          />
          <button
            onClick={analyzSymptoms}
            disabled={!symptoms.trim() || loading}
            className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send className="w-5 h-5" />}
            <span>{loading ? 'Analyse...' : 'Analyser'}</span>
          </button>
        </div>
        
        {diagnosis && (
          <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-800 mb-2">Analyse IA</h3>
            <p className="text-blue-700">{diagnosis}</p>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">⚠️ Cette analyse est informative. Consultez toujours un médecin pour un diagnostic précis.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIDoctor;
