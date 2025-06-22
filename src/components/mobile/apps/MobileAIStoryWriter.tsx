
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Wand2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIStoryWriterProps {
  onBack: () => void;
}

const MobileAIStoryWriter = ({ onBack }: MobileAIStoryWriterProps) => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('fantastique');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);

  const generateStory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Écrivez une histoire ${genre} captivante basée sur: ${prompt}. Créez des personnages mémorables et une intrigue engageante.`
        }
      });
      
      if (error) throw error;
      setStory(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Écrivain IA</h1>
        <BookOpen className="w-6 h-6 text-indigo-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Créer une histoire</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez l'idée de votre histoire..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="fantastique">Fantastique</option>
            <option value="science-fiction">Science-fiction</option>
            <option value="romance">Romance</option>
            <option value="thriller">Thriller</option>
            <option value="aventure">Aventure</option>
          </select>
          <button
            onClick={generateStory}
            disabled={!prompt.trim() || loading}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Écriture...' : 'Écrire histoire'}
          </button>
        </div>
        
        {story && (
          <div className="bg-indigo-50 rounded-2xl p-6">
            <h3 className="font-bold text-indigo-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Votre histoire
            </h3>
            <div className="text-indigo-700 whitespace-pre-wrap">{story}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIStoryWriter;
