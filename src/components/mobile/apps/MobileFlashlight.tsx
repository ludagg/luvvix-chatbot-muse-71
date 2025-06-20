
import React, { useState } from 'react';
import { ArrowLeft, Flashlight } from 'lucide-react';

interface MobileFlashlightProps {
  onBack: () => void;
}

const MobileFlashlight = ({ onBack }: MobileFlashlightProps) => {
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(100);

  const toggleFlashlight = () => {
    setIsOn(!isOn);
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-300 ${
      isOn ? 'bg-yellow-100' : 'bg-gray-900'
    }`}>
      <div className={`flex items-center justify-between p-4 border-b ${
        isOn ? 'border-gray-300 text-gray-900' : 'border-gray-700 text-white'
      }`}>
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Lampe de poche</h1>
        <div className="w-10" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Flashlight Button */}
        <div className="mb-8">
          <button
            onClick={toggleFlashlight}
            className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isOn 
                ? 'bg-yellow-400 shadow-yellow-400/50 scale-110' 
                : 'bg-gray-700 shadow-gray-700/50'
            }`}
          >
            {isOn ? (
              <div className="relative">
                <Flashlight className="w-24 h-24 text-gray-800" />
                <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-30"></div>
              </div>
            ) : (
              <Flashlight className="w-24 h-24 text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Status */}
        <div className="text-center mb-8">
          <p className={`text-2xl font-bold mb-2 ${
            isOn ? 'text-gray-800' : 'text-white'
          }`}>
            {isOn ? 'ALLUMÉE' : 'ÉTEINTE'}
          </p>
          <p className={`text-lg ${
            isOn ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Touchez pour {isOn ? 'éteindre' : 'allumer'}
          </p>
        </div>
        
        {/* Brightness Control */}
        {isOn && (
          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Luminosité: {brightness}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${brightness}%, #d1d5db ${brightness}%, #d1d5db 100%)`
              }}
            />
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => {
              setIsOn(true);
              setBrightness(50);
            }}
            className={`px-4 py-2 rounded-lg border ${
              isOn 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Faible
          </button>
          <button
            onClick={() => {
              setIsOn(true);
              setBrightness(100);
            }}
            className={`px-4 py-2 rounded-lg border ${
              isOn 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Maximum
          </button>
        </div>
        
        {/* Warning */}
        <div className="mt-8 p-4 bg-orange-100 rounded-lg max-w-sm">
          <p className="text-sm text-orange-800 text-center">
            ⚠️ Une utilisation prolongée peut affecter la batterie
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileFlashlight;
