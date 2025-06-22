
import React, { useState } from 'react';
import { ArrowLeft, Shield, Key, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIPasswordManagerProps {
  onBack: () => void;
}

const MobileAIPasswordManager = ({ onBack }: MobileAIPasswordManagerProps) => {
  const [requirements, setRequirements] = useState('');
  const [passwords, setPasswords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generatePasswords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Générez 5 mots de passe sécurisés selon ces critères: ${requirements}. Incluez des conseils de sécurité personnalisés.`
        }
      });
      
      if (error) throw error;
      setPasswords(data.response.split('\n').filter((p: string) => p.trim()));
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Gestionnaire Mots de Passe IA</h1>
        <Shield className="w-6 h-6 text-green-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Générer mots de passe</h2>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Exigences (longueur, caractères spéciaux, etc.)..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <button
            onClick={generatePasswords}
            disabled={!requirements || loading}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Génération...' : 'Générer mots de passe'}
          </button>
        </div>
        
        {passwords.length > 0 && (
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="font-bold text-green-800 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Mots de passe générés
            </h3>
            {passwords.map((password, index) => (
              <div key={index} className="bg-white p-3 rounded-lg mb-2 font-mono text-sm">
                {password}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIPasswordManager;
