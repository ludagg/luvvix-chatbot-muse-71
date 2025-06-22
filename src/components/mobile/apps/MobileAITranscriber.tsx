
import React, { useState } from 'react';
import { ArrowLeft, Mic, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAITranscriberProps {
  onBack: () => void;
}

const MobileAITranscriber = ({ onBack }: MobileAITranscriberProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const transcribeAudio = async () => {
    if (!audioFile) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Transcrivez ce fichier audio en texte avec une ponctuation correcte et une mise en forme claire.`
        }
      });
      
      if (error) throw error;
      setTranscription(data.response);
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
        <h1 className="text-lg font-bold">Transcripteur IA</h1>
        <Mic className="w-6 h-6 text-indigo-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Transcrire un audio</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="w-full p-4 border rounded-xl mb-4"
          />
          <button
            onClick={transcribeAudio}
            disabled={!audioFile || loading}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Transcription...' : 'Transcrire'}
          </button>
        </div>
        
        {transcription && (
          <div className="bg-indigo-50 rounded-2xl p-6">
            <h3 className="font-bold text-indigo-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Transcription
            </h3>
            <div className="text-indigo-700 whitespace-pre-wrap">{transcription}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAITranscriber;
