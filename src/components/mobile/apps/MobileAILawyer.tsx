
import React, { useState } from 'react';
import { ArrowLeft, Scale, MessageCircle, FileText, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAILawyerProps {
  onBack: () => void;
}

const MobileAILawyer = ({ onBack }: MobileAILawyerProps) => {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `En tant qu'avocat IA, donnez des conseils juridiques généraux sur: ${question}. Rappel: consultez un avocat pour des conseils personnalisés.`
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
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Avocat IA</h1>
        <Scale className="w-6 h-6 text-blue-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Question juridique</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez votre question juridique..."
            className="w-full h-32 p-4 border rounded-xl resize-none"
          />
          <button
            onClick={getAdvice}
            disabled={!question.trim() || loading}
            className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send className="w-5 h-5" />}
            <span>{loading ? 'Analyse...' : 'Obtenir conseil'}</span>
          </button>
        </div>
        
        {advice && (
          <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-800 mb-2">Conseil juridique</h3>
            <p className="text-blue-700">{advice}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAILawyer;
