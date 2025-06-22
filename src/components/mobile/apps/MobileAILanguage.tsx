
import React, { useState } from 'react';
import { ArrowLeft, Languages, BookOpen, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAILanguageProps {
  onBack: () => void;
}

const MobileAILanguage = ({ onBack }: MobileAILanguageProps) => {
  const [language, setLanguage] = useState('espagnol');
  const [concept, setConcept] = useState('');
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLesson = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez une leçon de ${language} sur: ${concept}. Incluez vocabulaire, grammaire, exemples pratiques et exercices avec audio phonétique.`
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
    <div className="h-full bg-gradient-to-br from-orange-50 to-yellow-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Professeur Langues IA</h1>
        <Languages className="w-6 h-6 text-orange-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Apprendre une langue</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="espagnol">Espagnol</option>
            <option value="anglais">Anglais</option>
            <option value="italien">Italien</option>
            <option value="allemand">Allemand</option>
            <option value="chinois">Chinois</option>
            <option value="japonais">Japonais</option>
          </select>
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Concept à apprendre (ex: se présenter)..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <button
            onClick={generateLesson}
            disabled={!concept.trim() || loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Créer leçon'}
          </button>
        </div>
        
        {lesson && (
          <div className="bg-orange-50 rounded-2xl p-6">
            <h3 className="font-bold text-orange-800 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Leçon de {language}
            </h3>
            <div className="text-orange-700 whitespace-pre-wrap">{lesson}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAILanguage;
