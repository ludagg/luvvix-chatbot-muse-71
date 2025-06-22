
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIFinanceProps {
  onBack: () => void;
}

const MobileAIFinance = ({ onBack }: MobileAIFinanceProps) => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Analysez cette situation financière et donnez des conseils personnalisés: Revenus: ${income}, Dépenses: ${expenses}. Proposez un plan d'épargne et d'investissement.`
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
    <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Conseiller IA Finance</h1>
        <DollarSign className="w-6 h-6 text-emerald-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Situation financière</h2>
          <input
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Revenus mensuels..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <textarea
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            placeholder="Listez vos dépenses principales..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <button
            onClick={getAdvice}
            disabled={!income.trim() || !expenses.trim() || loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Analyse...' : 'Obtenir conseils'}
          </button>
        </div>
        
        {advice && (
          <div className="bg-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Conseils financiers personnalisés
            </h3>
            <div className="text-emerald-700 whitespace-pre-wrap">{advice}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIFinance;
