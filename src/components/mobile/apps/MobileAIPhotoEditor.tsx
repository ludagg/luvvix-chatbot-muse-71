
import React, { useState } from 'react';
import { ArrowLeft, Camera, Edit, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MobileAIPhotoEditorProps {
  onBack: () => void;
}

const MobileAIPhotoEditor = ({ onBack }: MobileAIPhotoEditorProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [editRequest, setEditRequest] = useState('');
  const [editedImage, setEditedImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const editImage = async () => {
    if (!image || !editRequest) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('message', `Éditez cette image selon cette demande: ${editRequest}. Proposez des modifications créatives et professionnelles.`);
      
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: formData
      });
      
      if (error) throw error;
      setEditedImage(data.response);
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
        <h1 className="text-lg font-bold">Éditeur Photo IA</h1>
        <Edit className="w-6 h-6 text-pink-500" />
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Éditer une photo</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-4 border rounded-xl mb-4"
          />
          <textarea
            value={editRequest}
            onChange={(e) => setEditRequest(e.target.value)}
            placeholder="Décrivez les modifications souhaitées..."
            className="w-full h-24 p-4 border rounded-xl resize-none mb-4"
          />
          <button
            onClick={editImage}
            disabled={!image || !editRequest || loading}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-medium"
          >
            {loading ? 'Édition...' : 'Éditer photo'}
          </button>
        </div>
        
        {editedImage && (
          <div className="bg-pink-50 rounded-2xl p-6">
            <h3 className="font-bold text-pink-800 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Suggestions d'édition
            </h3>
            <div className="text-pink-700 whitespace-pre-wrap">{editedImage}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAIPhotoEditor;
