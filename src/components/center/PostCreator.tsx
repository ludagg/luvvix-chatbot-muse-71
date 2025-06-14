
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Image as ImageIcon, MapPin, Smile, Video, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PostCreatorProps {
  onPostCreated: (postData: any) => void;
}

const PostCreator = ({ onPostCreated }: PostCreatorProps) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez écrire quelque chose"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData: any = {
        content: content.trim(),
        media_urls: [],
        video_url: null
      };

      // Simuler l'upload d'images
      if (selectedImages.length > 0) {
        postData.media_urls = selectedImages.map((_, index) => 
          `https://example.com/images/${Date.now()}_${index}.jpg`
        );
      }

      // Simuler l'upload de vidéo
      if (selectedVideo) {
        postData.video_url = `https://example.com/videos/${Date.now()}.mp4`;
      }

      await onPostCreated(postData);
      
      // Reset form
      setContent('');
      setSelectedImages([]);
      setSelectedVideo(null);
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier le post"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast({
        variant: "destructive",
        title: "Limite atteinte",
        description: "Vous ne pouvez ajouter que 4 images maximum"
      });
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: "La vidéo ne doit pas dépasser 100MB"
        });
        return;
      }
      setSelectedVideo(file);
      setSelectedImages([]); // Clear images when video is selected
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Quoi de neuf ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 p-0 text-lg placeholder:text-gray-500 focus-visible:ring-0"
            />

            {/* Prévisualisation des images */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Prévisualisation de la vidéo */}
            {selectedVideo && (
              <div className="relative">
                <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">{selectedVideo.name}</p>
                    <p className="text-xs text-gray-300">
                      {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeVideo}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={!!selectedVideo}
                />
                <label
                  htmlFor="image-upload"
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    selectedVideo 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                </label>

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={selectedImages.length > 0}
                />
                <label
                  htmlFor="video-upload"
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    selectedImages.length > 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Video className="w-5 h-5" />
                </label>

                <button className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                  <Camera className="w-5 h-5" />
                </button>

                <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                  <MapPin className="w-5 h-5" />
                </button>

                <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Publication...' : 'Publier'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCreator;
