
import React, { useState } from 'react';
import { ArrowLeft, Calculator, PieChart, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIBudgetPlannerProps {
  onBack: () => void;
}

const MobileAIBudgetPlanner = ({ onBack }: MobileAIBudgetPlannerProps) => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [goals, setGoals] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const createBudget = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez un plan budgétaire détaillé avec revenus: ${income}, dépenses: ${expenses}, objectifs: ${goals}. Incluez répartition et conseils d'épargne.`
        }
      });
      
      if (error) throw error;
      setBudget(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-teal-50 to-cyan-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Planificateur Budget IA</h1>
        <Calculator className="w-6 h-6 text-teal-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Informations financières</h2>
          <input
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Revenus mensuels..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <textarea
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            placeholder="Dépenses mensuelles détaillées..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Objectifs financiers..."
            className="w-full h-20 p-4 border rounded-xl resize-none mb-4"
          />
          <button
            onClick={createBudget}
            disabled={!income || !expenses || loading}
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Créer budget'}
          </button>
        </div>
        
        {budget && (
          <div className="bg-teal-50 rounded-2xl p-6">
            <h3 className="font-bold text-teal-800 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Plan budgétaire
            </h3>
            <div className="text-teal-700 whitespace-pre-wrap">{budget}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIBudgetPlanner;
