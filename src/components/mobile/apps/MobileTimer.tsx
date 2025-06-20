
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw } from 'lucide-react';

interface MobileTimerProps {
  onBack: () => void;
}

const MobileTimer = ({ onBack }: MobileTimerProps) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'stopwatch'>('timer');
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (stopwatchActive) {
      intervalRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stopwatchActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    const totalSeconds = timerMinutes * 60 + timerSeconds;
    setTimeLeft(totalSeconds);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(0);
  };

  const startStopwatch = () => {
    setStopwatchActive(true);
  };

  const stopStopwatch = () => {
    setStopwatchActive(false);
  };

  const resetStopwatch = () => {
    setStopwatchActive(false);
    setStopwatchTime(0);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Minuteur</h1>
        <div className="w-10" />
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'timer' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'
          }`}
        >
          Minuteur
        </button>
        <button
          onClick={() => setActiveTab('stopwatch')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'stopwatch' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'
          }`}
        >
          Chronomètre
        </button>
      </div>
      
      <div className="flex-1 p-8">
        {activeTab === 'timer' ? (
          <div className="text-center">
            {/* Timer Display */}
            <div className="mb-8">
              <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
                {timeLeft > 0 ? formatTime(timeLeft) : formatTime(timerMinutes * 60 + timerSeconds)}
              </div>
              
              {timeLeft === 0 && !timerActive && (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                        className="w-20 p-2 text-center border rounded-lg text-xl"
                      />
                    </div>
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 0)}
                        className="w-20 p-2 text-center border rounded-lg text-xl"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Timer Controls */}
            <div className="flex justify-center space-x-4">
              {!timerActive ? (
                <button
                  onClick={startTimer}
                  disabled={timerMinutes === 0 && timerSeconds === 0}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center disabled:opacity-50"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <Pause className="w-8 h-8 text-white" />
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center"
              >
                <RotateCcw className="w-8 h-8 text-white" />
              </button>
            </div>
            
            {timeLeft === 0 && timerActive === false && (timerMinutes > 0 || timerSeconds > 0) && (
              <div className="mt-8 p-4 bg-red-100 rounded-lg">
                <p className="text-red-800 font-medium">⏰ Temps écoulé !</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {/* Stopwatch Display */}
            <div className="mb-8">
              <div className="text-6xl font-mono font-bold text-gray-800">
                {formatTime(stopwatchTime)}
              </div>
            </div>
            
            {/* Stopwatch Controls */}
            <div className="flex justify-center space-x-4">
              {!stopwatchActive ? (
                <button
                  onClick={startStopwatch}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              ) : (
                <button
                  onClick={stopStopwatch}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <Square className="w-8 h-8 text-white" />
                </button>
              )}
              
              <button
                onClick={resetStopwatch}
                className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center"
              >
                <RotateCcw className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTimer;
