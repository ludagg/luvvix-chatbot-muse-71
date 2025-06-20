
import React, { useState, useRef } from 'react';
import { ArrowLeft, Mic, Square, Play, Pause, Trash2, Share } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  duration: string;
  date: Date;
  url: string;
}

interface MobileVoiceRecorderProps {
  onBack: () => void;
}

const MobileVoiceRecorder = ({ onBack }: MobileVoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([
    { id: '1', name: 'Enregistrement 1', duration: '0:45', date: new Date(), url: '' },
    { id: '2', name: 'Note vocale', duration: '1:23', date: new Date(), url: '' },
  ]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const newRecording: Recording = {
      id: Date.now().toString(),
      name: `Enregistrement ${recordings.length + 1}`,
      duration: formatTime(recordingTime),
      date: new Date(),
      url: ''
    };
    
    setRecordings([newRecording, ...recordings]);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = (id: string) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(id);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter(rec => rec.id !== id));
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Enregistreur vocal</h1>
        <div className="w-10" />
      </div>
      
      {/* Recording Interface */}
      <div className="p-8 bg-gray-50 text-center border-b">
        <div className="mb-6">
          {isRecording ? (
            <div className="w-32 h-32 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 bg-white rounded-full"></div>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="w-32 h-32 mx-auto bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              <Mic className="w-16 h-16 text-white" />
            </button>
          )}
        </div>
        
        <div className="text-3xl font-mono font-bold text-gray-800 mb-4">
          {formatTime(recordingTime)}
        </div>
        
        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-gray-800 text-white rounded-full flex items-center space-x-2 mx-auto"
          >
            <Square className="w-5 h-5" />
            <span>Arrêter</span>
          </button>
        )}
        
        {!isRecording && recordingTime === 0 && (
          <p className="text-gray-600">Touchez pour enregistrer</p>
        )}
      </div>
      
      {/* Recordings List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Mes enregistrements</h2>
        
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div key={recording.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => togglePlayback(recording.id)}
                  className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  {currentlyPlaying === recording.id ? 
                    <Pause className="w-6 h-6 text-white" /> : 
                    <Play className="w-6 h-6 text-white ml-1" />
                  }
                </button>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{recording.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{recording.duration}</span>
                    <span>•</span>
                    <span>{recording.date.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-200 rounded-lg">
                    <Share className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteRecording(recording.id)}
                    className="p-2 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
              
              {currentlyPlaying === recording.id && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {recordings.length === 0 && (
            <div className="text-center py-8">
              <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enregistrement</h3>
              <p className="text-gray-600">Commencez votre premier enregistrement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileVoiceRecorder;
