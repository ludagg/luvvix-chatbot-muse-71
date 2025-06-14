
import React, { useState } from 'react';
import { X, Image as ImageIcon, MapPin, Smile, Calendar, BarChart3 } from 'lucide-react';

interface TwitterComposerProps {
  onClose: () => void;
  onPost: (content: string, images: File[]) => void;
  isSubmitting: boolean;
}

const TwitterComposer = ({ onClose, onPost, isSubmitting }: TwitterComposerProps) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 4) return;
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPost(content, selectedImages);
    setContent('');
    setSelectedImages([]);
    onClose();
  };

  const remainingChars = 280 - content.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-start justify-center pt-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || remainingChars < 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Publication...' : 'Tweeter'}
          </button>
        </div>

        {/* Composer */}
        <div className="p-4">
          <div className="flex space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Quoi de neuf ?"
                className="w-full text-xl placeholder-gray-500 border-none outline-none resize-none"
                rows={4}
                maxLength={280}
                autoFocus
              />

              {/* Images preview */}
              {selectedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center hover:bg-opacity-80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions bar */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={selectedImages.length >= 4}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      selectedImages.length >= 4 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </label>
                  
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <BarChart3 className="w-5 h-5" />
                  </button>
                  
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <Calendar className="w-5 h-5" />
                  </button>
                  
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                {/* Character counter */}
                <div className="flex items-center space-x-3">
                  <div className={`text-sm ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                    {remainingChars < 20 && remainingChars}
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 relative ${
                    remainingChars < 0 ? 'border-red-500' : 
                    remainingChars < 20 ? 'border-yellow-500' : 'border-gray-300'
                  }`}>
                    <div 
                      className={`absolute inset-1 rounded-full ${
                        remainingChars < 0 ? 'bg-red-500' : 
                        remainingChars < 20 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        transform: `scale(${Math.max(0, Math.min(1, (280 - content.length) / 280))})`,
                        transformOrigin: 'center'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterComposer;
