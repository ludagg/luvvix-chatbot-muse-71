
import React, { useRef } from "react";

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

  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 cursor-pointer transition hover:border-purple-400 bg-white/60 dark:bg-gray-700/50 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
      aria-label="Déposez une image ou cliquez pour choisir un fichier"
      style={{ minHeight: 90, minWidth: 110 }}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="Aperçu" className="rounded shadow max-h-24 mb-2" />
      ) : (
        <div className="text-gray-500 text-xs">Déposez une image<br/>ou cliquez ici</div>
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
