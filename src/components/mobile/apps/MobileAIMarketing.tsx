
import React, { useState } from 'react';
import { ArrowLeft, Megaphone, Target, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIMarketingProps {
  onBack: () => void;
}

const MobileAIMarketing = ({ onBack }: MobileAIMarketingProps) => {
  const [product, setProduct] = useState('');
  const [target, setTarget] = useState('');
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);

  const generateStrategy = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez une stratégie marketing complète pour: ${product}. Cible: ${target}. Incluez canaux, contenu, budget et métriques.`
        }
      });
      
      if (error) throw error;
      setStrategy(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Marketing IA</h1>
        <Megaphone className="w-6 h-6 text-blue-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Stratégie marketing</h2>
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Produit/Service à promouvoir..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Public cible..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <button
            onClick={generateStrategy}
            disabled={!product.trim() || !target.trim() || loading}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Générer stratégie'}
          </button>
        </div>
        
        {strategy && (
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Stratégie marketing personnalisée
            </h3>
            <div className="text-blue-700 whitespace-pre-wrap">{strategy}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIMarketing;
