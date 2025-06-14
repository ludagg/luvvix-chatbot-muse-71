
import React from 'react';
import { X, Check } from 'lucide-react';

interface StoryPreviewModalProps {
  file: File;
  onPublish: (file: File) => void;
  onCancel: () => void;
}

const StoryPreviewModal = ({ file, onPublish, onCancel }: StoryPreviewModalProps) => {
  const [fileUrl, setFileUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (file) {
      setFileUrl(URL.createObjectURL(file));
      return () => {
        URL.revokeObjectURL(fileUrl);
      };
    }
    // eslint-disable-next-line
  }, [file]);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-xs w-full relative flex flex-col items-center">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="w-full flex justify-center items-center mb-4">
          {isImage && (
            <img src={fileUrl} alt="Preview" className="max-w-full max-h-60 rounded-lg" />
          )}
          {isVideo && (
            <video src={fileUrl} controls className="max-w-full max-h-60 rounded-lg" />
          )}
        </div>
        <div className="flex w-full space-x-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium"
          >
            Annuler
          </button>
          <button
            onClick={() => onPublish(file)}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-full font-medium flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4 mr-1" />
            <span>Publier</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryPreviewModal;
