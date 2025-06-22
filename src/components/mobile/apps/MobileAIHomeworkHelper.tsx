
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, HelpCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIHomeworkHelperProps {
  onBack: () => void;
}

const MobileAIHomeworkHelper = ({ onBack }: MobileAIHomeworkHelperProps) => {
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('collège');
  const [question, setQuestion] = useState('');
  const [help, setHelp] = useState('');
  const [loading, setLoading] = useState(false);

  const getHomeworkHelp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Aidez avec ce devoir niveau ${level} en ${subject}: ${question}. Expliquez étape par étape sans donner directement la réponse.`
        }
      });
      
      if (error) throw error;
      setHelp(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-amber-50 to-yellow-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Assistant Devoirs IA</h1>
        <BookOpen className="w-6 h-6 text-amber-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Aide aux devoirs</h2>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Matière..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="primaire">Primaire</option>
            <option value="collège">Collège</option>
            <option value="lycée">Lycée</option>
            <option value="université">Université</option>
          </select>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Votre question ou exercice..."
            className="w-full h-32 p-4 border rounded-xl resize-none mb-4"
          />
          <button
            onClick={getHomeworkHelp}
            disabled={!subject || !question || loading}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Recherche...' : 'Obtenir aide'}
          </button>
        </div>
        
        {help && (
          <div className="bg-amber-50 rounded-2xl p-6">
            <h3 className="font-bold text-amber-800 mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Aide personnalisée
            </h3>
            <div className="text-amber-700 whitespace-pre-wrap">{help}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIHomeworkHelper;
