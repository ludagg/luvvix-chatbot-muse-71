
import React, { useState } from 'react';
import { ArrowLeft, Navigation, Search, MapPin, Car, Walking, Bike } from 'lucide-react';

interface MobileMapProps {
  onBack: () => void;
}

const MobileMap = ({ onBack }: MobileMapProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving');

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 bg-white rounded-full shadow-md">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button className="p-2 bg-white rounded-full shadow-md">
            <Navigation className="w-6 h-6 text-blue-500" />
          </button>
        </div>
      </div>
      
      {/* Map View */}
      <div className="flex-1 bg-gradient-to-br from-green-200 via-blue-200 to-blue-300 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Carte Interactive</h3>
            <p className="text-gray-600">Recherchez un lieu ou activez la géolocalisation</p>
          </div>
        </div>
        
        {/* Mock Map Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-16 w-3 h-3 bg-blue-500 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-green-500 rounded-full"></div>
        
        {/* User Location */}
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg">
            <div className="w-full h-full bg-blue-600 rounded-full animate-ping opacity-30"></div>
          </div>
        </div>
      </div>
      
      {/* Travel Mode Selector */}
      <div className="absolute bottom-32 left-4 right-4 z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex justify-around">
            <button
              onClick={() => setTravelMode('driving')}
              className={`flex-1 flex flex-col items-center p-3 rounded-xl ${
                travelMode === 'driving' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Car className="w-6 h-6 mb-1" />
              <span className="text-xs">Voiture</span>
            </button>
            <button
              onClick={() => setTravelMode('walking')}
              className={`flex-1 flex flex-col items-center p-3 rounded-xl ${
                travelMode === 'walking' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Walking className="w-6 h-6 mb-1" />
              <span className="text-xs">À pied</span>
            </button>
            <button
              onClick={() => setTravelMode('cycling')}
              className={`flex-1 flex flex-col items-center p-3 rounded-xl ${
                travelMode === 'cycling' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Bike className="w-6 h-6 mb-1" />
              <span className="text-xs">Vélo</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl shadow-lg">
        <div className="p-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-medium">Ma position</h3>
                <p className="text-sm text-gray-600">Paris, France</p>
              </div>
            </div>
            
            <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium">
              Obtenir un itinéraire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMap;
