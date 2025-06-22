
import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIEmailAssistantProps {
  onBack: () => void;
}

const MobileAIEmailAssistant = ({ onBack }: MobileAIEmailAssistantProps) => {
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professionnel');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const generateEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Rédigez un email ${tone} pour ce contexte: ${context}. Incluez objet, corps du message et formule de politesse adaptée.`
        }
      });
      
      if (error) throw error;
      setEmail(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Assistant Email IA</h1>
        <Mail className="w-6 h-6 text-blue-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Générer un email</h2>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Contexte de l'email..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-4 border rounded-xl mb-4"
          >
            <option value="professionnel">Professionnel</option>
            <option value="amical">Amical</option>
            <option value="formel">Formel</option>
            <option value="commercial">Commercial</option>
          </select>
          <button
            onClick={generateEmail}
            disabled={!context || loading}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Génération...' : 'Générer email'}
          </button>
        </div>
        
        {email && (
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Email généré
            </h3>
            <div className="text-blue-700 whitespace-pre-wrap">{email}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIEmailAssistant;
