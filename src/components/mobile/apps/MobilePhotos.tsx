
import React, { useState } from 'react';
import { ArrowLeft, Camera, Image, Share, Trash2, Download } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  name: string;
  date: Date;
}

interface MobilePhotosProps {
  onBack: () => void;
}

const MobilePhotos = ({ onBack }: MobilePhotosProps) => {
  const [photos, setPhotos] = useState<Photo[]>([
    { id: '1', url: '/placeholder.svg', name: 'Photo 1', date: new Date() },
    { id: '2', url: '/placeholder.svg', name: 'Photo 2', date: new Date() },
    { id: '3', url: '/placeholder.svg', name: 'Photo 3', date: new Date() },
  ]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        name: file.name,
        date: new Date()
      };
      setPhotos([newPhoto, ...photos]);
    }
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter(photo => photo.id !== id));
    setSelectedPhoto(null);
  };

  if (selectedPhoto) {
    return (
      <div className="h-full bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 bg-black/80 text-white">
          <button onClick={() => setSelectedPhoto(null)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">{selectedPhoto.name}</h1>
          <div className="flex space-x-2">
            <button className="p-2">
              <Share className="w-6 h-6" />
            </button>
            <button onClick={() => deletePhoto(selectedPhoto.id)} className="p-2">
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Photos</h1>
        <label className="p-2 bg-blue-500 rounded-lg cursor-pointer">
          <Camera className="w-6 h-6 text-white" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-1 p-1">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobilePhotos;
