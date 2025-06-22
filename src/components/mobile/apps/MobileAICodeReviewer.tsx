
import React, { useState } from 'react';
import { ArrowLeft, Code, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAICodeReviewerProps {
  onBack: () => void;
}

const MobileAICodeReviewer = ({ onBack }: MobileAICodeReviewerProps) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const reviewCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Analysez ce code ${language} et fournissez une revue détaillée avec suggestions d'amélioration, bonnes pratiques et corrections: ${code}`
        }
      });
      
      if (error) throw error;
      setReview(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-gray-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Réviseur Code IA</h1>
        <Code className="w-6 h-6 text-slate-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Code à réviser</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="react">React</option>
          </select>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Collez votre code ici..."
            className="w-full h-32 p-4 border rounded-xl resize-none mb-4 font-mono"
          />
          <button
            onClick={reviewCode}
            disabled={!code || loading}
            className="w-full bg-slate-600 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Analyse...' : 'Réviser le code'}
          </button>
        </div>
        
        {review && (
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Revue de code
            </h3>
            <div className="text-slate-700 whitespace-pre-wrap">{review}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAICodeReviewer;
