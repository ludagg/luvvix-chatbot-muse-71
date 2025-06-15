
import React, { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  previewUrl?: string | null;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, previewUrl, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset the preview by triggering onImageSelected with an empty file
    const emptyFile = new File([], '');
    onImageSelected(emptyFile);
  };

  return (
    <div className="relative">
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Aperçu" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-gray-200" 
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={removeImage}
            className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          className="h-10 w-10 md:h-12 md:w-12 p-0 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        </Button>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUploader;
