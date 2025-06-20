
import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

interface MobileMusicProps {
  onBack: () => void;
}

const MobileMusic = ({ onBack }: MobileMusicProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songs] = useState<Song[]>([
    { id: '1', title: 'Song One', artist: 'Artist A', album: 'Album 1', duration: '3:45', cover: '/placeholder.svg' },
    { id: '2', title: 'Song Two', artist: 'Artist B', album: 'Album 2', duration: '4:12', cover: '/placeholder.svg' },
    { id: '3', title: 'Song Three', artist: 'Artist C', album: 'Album 3', duration: '3:28', cover: '/placeholder.svg' },
  ]);

  const playPause = () => {
    setIsPlaying(!isPlaying);
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="h-full bg-gradient-to-b from-purple-900 to-black text-white flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Musique</h1>
        <div className="w-10" />
      </div>
      
      {/* Now Playing */}
      {currentSong && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-64 h-64 mb-8">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{currentSong.title}</h2>
            <p className="text-lg text-gray-300">{currentSong.artist}</p>
          </div>
          
          <div className="w-full mb-8">
            <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
              <div className="bg-white h-2 rounded-full w-1/3"></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>1:23</span>
              <span>{currentSong.duration}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <button className="p-3">
              <Shuffle className="w-6 h-6" />
            </button>
            <button className="p-3">
              <SkipBack className="w-8 h-8" />
            </button>
            <button
              onClick={playPause}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
            >
              {isPlaying ? 
                <Pause className="w-8 h-8 text-black" /> : 
                <Play className="w-8 h-8 text-black ml-1" />
              }
            </button>
            <button className="p-3">
              <SkipForward className="w-8 h-8" />
            </button>
            <button className="p-3">
              <Repeat className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      
      {/* Playlist */}
      {!currentSong && (
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-bold mb-4">Ma Playlist</h2>
          <div className="space-y-3">
            {songs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
              >
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{song.title}</h3>
                  <p className="text-sm text-gray-300">{song.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{song.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mini Player */}
      {currentSong && (
        <div className="bg-black/50 backdrop-blur-lg p-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-sm">{currentSong.title}</h3>
              <p className="text-xs text-gray-300">{currentSong.artist}</p>
            </div>
            <button onClick={playPause} className="p-2">
              {isPlaying ? 
                <Pause className="w-6 h-6" /> : 
                <Play className="w-6 h-6" />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMusic;
