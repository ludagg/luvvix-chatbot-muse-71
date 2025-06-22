
import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Camera, Utensils } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIChefProps {
  onBack: () => void;
}

const MobileAIChef = ({ onBack }: MobileAIChefProps) => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez une recette délicieuse et détaillée avec ces ingrédients: ${ingredients}. Incluez temps de préparation, instructions étape par étape, et conseils de chef.`
        }
      });
      
      if (error) throw error;
      setRecipe(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-yellow-50 to-orange-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Chef IA</h1>
        <ChefHat className="w-6 h-6 text-yellow-600" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Ingrédients disponibles</h2>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Listez vos ingrédients disponibles..."
            className="w-full h-24 p-4 border rounded-xl resize-none"
          />
          <button
            onClick={generateRecipe}
            disabled={!ingredients.trim() || loading}
            className="w-full mt-4 bg-yellow-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Générer recette'}
          </button>
        </div>
        
        {recipe && (
          <div className="bg-yellow-50 rounded-2xl p-6">
            <h3 className="font-bold text-yellow-800 mb-4 flex items-center">
              <Utensils className="w-5 h-5 mr-2" />
              Votre recette personnalisée
            </h3>
            <div className="text-yellow-700 whitespace-pre-wrap">{recipe}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIChef;
