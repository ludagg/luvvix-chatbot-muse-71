
import React, { useState, useRef } from 'react';
import { X, Upload, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  onClose: () => void;
}

const VideoUploader = ({ onVideoSelect, onClose }: VideoUploaderProps) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          toast({
            title: "Fichier trop volumineux",
            description: "La vidéo ne doit pas dépasser 100 MB",
            variant: "destructive"
          });
          return;
        }
        
        setSelectedVideo(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
      } else {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner un fichier vidéo",
          variant: "destructive"
        });
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleConfirm = () => {
    if (selectedVideo) {
      onVideoSelect(selectedVideo);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Ajouter une vidéo</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!selectedVideo ? (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Cliquez pour sélectionner une vidéo</p>
                <p className="text-sm text-gray-500">Formats supportés: MP4, AVI, MOV</p>
                <p className="text-sm text-gray-500">Taille max: 100 MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-48 object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </button>
              </div>

              {/* Video Info */}
              <div className="text-sm text-gray-600">
                <p><strong>Nom:</strong> {selectedVideo.name}</p>
                <p><strong>Taille:</strong> {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
                <p><strong>Type:</strong> {selectedVideo.type}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setVideoUrl('');
                    setIsPlaying(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Changer
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
