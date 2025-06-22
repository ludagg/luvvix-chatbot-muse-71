
import React, { useState } from 'react';
import { ArrowLeft, GraduationCap, Brain, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAITutorProps {
  onBack: () => void;
}

const MobileAITutor = ({ onBack }: MobileAITutorProps) => {
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('débutant');
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLesson = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez une leçon complète niveau ${level} sur: ${subject}. Incluez explications claires, exemples pratiques et exercices.`
        }
      });
      
      if (error) throw error;
      setLesson(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-green-50 to-teal-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Tuteur IA</h1>
        <GraduationCap className="w-6 h-6 text-green-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Créer une leçon</h2>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet à apprendre..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
          </select>
          <button
            onClick={generateLesson}
            disabled={!subject.trim() || loading}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Créer leçon'}
          </button>
        </div>
        
        {lesson && (
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="font-bold text-green-800 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Votre leçon personnalisée
            </h3>
            <div className="text-green-700 whitespace-pre-wrap">{lesson}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAITutor;
