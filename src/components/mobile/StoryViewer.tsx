
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string;
    full_name: string;
  };
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  duration?: number;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const currentStory = stories[currentIndex];
  const storyDuration = currentStory?.duration || 5000; // 5 seconds default

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (100 / storyDuration) * 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, storyDuration]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: index < currentIndex ? '100%' : 
                       index === currentIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
            <img 
              src={currentStory?.user.avatar_url} 
              alt={currentStory?.user.username}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{currentStory?.user.full_name}</p>
            <p className="text-gray-300 text-xs">Il y a 2h</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white p-2">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Story content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {currentStory?.media_type === 'video' ? (
          <video 
            src={currentStory.media_url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted={isMuted}
            onEnded={nextStory}
          />
        ) : (
          <img 
            src={currentStory?.media_url}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Navigation areas */}
        <button 
          onClick={prevStory}
          className="absolute left-0 top-0 w-1/3 h-full z-10"
          disabled={currentIndex === 0}
        />
        <button 
          onClick={togglePlayPause}
          className="absolute center top-0 w-1/3 h-full z-10"
        />
        <button 
          onClick={nextStory}
          className="absolute right-0 top-0 w-1/3 h-full z-10"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          {currentStory?.media_type === 'video' && (
            <>
              <button onClick={togglePlayPause} className="text-white p-2">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="text-white p-2">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-white p-2">
            <Heart className="w-6 h-6" />
          </button>
          <button className="text-white p-2">
            <Share className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
