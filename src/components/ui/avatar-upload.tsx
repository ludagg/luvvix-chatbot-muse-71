
import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (file: File | null, preview: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'md',
  className = ''
}) => {
  const [preview, setPreview] = useState<string>(currentAvatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image valide",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onAvatarChange(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onAvatarChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={preview} alt="Profile" />
        <AvatarFallback>
          <Camera className="w-6 h-6 text-gray-400" />
        </AvatarFallback>
      </Avatar>
      
      <div className="absolute -bottom-2 -right-2 flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 rounded-full p-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-3 h-3" />
        </Button>
        
        {preview && (
          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
