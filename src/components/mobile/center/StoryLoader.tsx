
import React from 'react';
import { LoaderCircle } from 'lucide-react';

const StoryLoader = ({ text = "Chargement..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center py-8">
    <LoaderCircle className="w-10 h-10 text-blue-500 animate-spin mb-2" />
    <span className="text-sm text-blue-500 font-medium">{text}</span>
  </div>
);

export default StoryLoader;
