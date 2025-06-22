
import React, { useState } from 'react';
import { ArrowLeft, FileUser, Briefcase, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIResumeBuilderProps {
  onBack: () => void;
}

const MobileAIResumeBuilder = ({ onBack }: MobileAIResumeBuilderProps) => {
  const [profile, setProfile] = useState('');
  const [experience, setExperience] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Créez un CV professionnel pour ce profil: ${profile}, expérience: ${experience}, poste visé: ${targetJob}. Format structuré et impactant.`
        }
      });
      
      if (error) throw error;
      setResume(data.response);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-emerald-50 to-green-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Créateur CV IA</h1>
        <FileUser className="w-6 h-6 text-emerald-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Informations CV</h2>
          <textarea
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Profil personnel..."
            className="w-full h-20 p-4 border rounded-xl resize-none mb-4"
          />
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Expériences professionnelles..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <input
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            placeholder="Poste visé..."
            className="w-full p-4 border rounded-xl mb-4"
          />
          <button
            onClick={generateResume}
            disabled={!profile || !experience || loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Création...' : 'Créer CV'}
          </button>
        </div>
        
        {resume && (
          <div className="bg-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              CV généré
            </h3>
            <div className="text-emerald-700 whitespace-pre-wrap">{resume}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIResumeBuilder;
