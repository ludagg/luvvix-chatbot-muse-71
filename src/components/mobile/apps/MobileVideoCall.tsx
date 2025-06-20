
import React, { useState } from 'react';
import { ArrowLeft, Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';

interface MobileVideoCallProps {
  onBack: () => void;
}

const MobileVideoCall = ({ onBack }: MobileVideoCallProps) => {
  const [inCall, setInCall] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [contacts] = useState([
    { id: '1', name: 'Alice Martin', avatar: '/placeholder.svg', status: 'en ligne' },
    { id: '2', name: 'Bob Dupont', avatar: '/placeholder.svg', status: 'occupé' },
    { id: '3', name: 'Claire Dubois', avatar: '/placeholder.svg', status: 'absent' },
  ]);

  const startCall = (contactName: string) => {
    setInCall(true);
  };

  const endCall = () => {
    setInCall(false);
  };

  if (inCall) {
    return (
      <div className="h-full bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black">
          <div className="h-full flex flex-col">
            <div className="flex-1 relative">
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 rounded-full bg-gray-600 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Alice Martin</h2>
                  <p className="text-gray-300">Appel en cours...</p>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 w-24 h-32 bg-gray-800 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl">📹</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    micEnabled ? 'bg-gray-600' : 'bg-red-600'
                  }`}
                >
                  {micEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
                </button>
                
                <button
                  onClick={endCall}
                  className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center"
                >
                  <PhoneOff className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    videoEnabled ? 'bg-gray-600' : 'bg-red-600'
                  }`}
                >
                  {videoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Appel Vidéo</h1>
        <div className="w-10" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    contact.status === 'en ligne' ? 'bg-green-500' :
                    contact.status === 'occupé' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <p className="text-sm text-gray-600">{contact.status}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => startCall(contact.name)}
                  className="p-3 bg-blue-500 rounded-full"
                >
                  <Video className="w-5 h-5 text-white" />
                </button>
                <button className="p-3 bg-green-500 rounded-full">
                  <Phone className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileVideoCall;
