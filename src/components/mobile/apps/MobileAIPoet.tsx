
import React, { useState } from 'react';
import { ArrowLeft, Feather, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIPoetProps {
  onBack: () => void;
}

const MobileAIPoet = ({ onBack }: MobileAIPoetProps) => {
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('romantique');
  const [poem, setPoem] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePoem = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Écrivez un beau poème ${style} sur le thème: ${theme}. Soyez créatif et émotionnel.`
        }
      });
      
      if (error) throw error;
      setPoem(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Poète IA</h1>
        <Feather className="w-6 h-6 text-purple-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Créer un poème</h2>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Thème du poème..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="romantique">Romantique</option>
            <option value="mélancolique">Mélancolique</option>
            <option value="joyeux">Joyeux</option>
            <option value="libre">Vers libre</option>
          </select>
          <button
            onClick={generatePoem}
            disabled={!theme.trim() || loading}
            className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Écrire poème'}
          </button>
        </div>
        
        {poem && (
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
            <h3 className="font-bold text-purple-800 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Votre poème
            </h3>
            <div className="text-purple-700 whitespace-pre-wrap italic">{poem}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIPoet;
