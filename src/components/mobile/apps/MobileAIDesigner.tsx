
import React, { useState } from 'react';
import { ArrowLeft, Palette, Sparkles, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIDesignerProps {
  onBack: () => void;
}

const MobileAIDesigner = ({ onBack }: MobileAIDesignerProps) => {
  const [project, setProject] = useState('');
  const [style, setStyle] = useState('moderne');
  const [design, setDesign] = useState('');
  const [loading, setLoading] = useState(false);

  const generateDesign = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez un concept de design ${style} détaillé pour: ${project}. Incluez palette de couleurs, typographie, layout et éléments visuels.`
        }
      });
      
      if (error) throw error;
      setDesign(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Designer IA</h1>
        <Palette className="w-6 h-6 text-pink-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Projet à designer</h2>
          <textarea
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Décrivez votre projet de design..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="moderne">Moderne</option>
            <option value="minimaliste">Minimaliste</option>
            <option value="vintage">Vintage</option>
            <option value="luxueux">Luxueux</option>
            <option value="créatif">Créatif</option>
          </select>
          <button
            onClick={generateDesign}
            disabled={!project.trim() || loading}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Générer design'}
          </button>
        </div>
        
        {design && (
          <div className="bg-pink-50 rounded-2xl p-6">
            <h3 className="font-bold text-pink-800 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Concept de design
            </h3>
            <div className="text-pink-700 whitespace-pre-wrap">{design}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIDesigner;
