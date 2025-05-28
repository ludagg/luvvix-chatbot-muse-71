import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useCall } from '../../../contexts/CallContext'; // Adjust path

function CallWindow() {
  const { 
    currentCall, 
    endCall, 
    localStreamRef, // Ref to the local MediaStream object itself
    remoteStreamRef // Ref to the remote MediaStream object
  } = useCall();

  const localVideoRef = useRef(null); // Ref for the <video> element for local stream
  const remoteVideoRef = useRef(null); // Ref for the <video> element for remote stream

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(currentCall?.type === 'video');
  const [callDuration, setCallDuration] = useState(0); // Simulated duration in seconds
  
  // Attach local stream to local video element
  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      console.log("Attaching local stream to video element.");
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef.current]); // Re-run if the stream object reference changes

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteStreamRef.current && remoteVideoRef.current) {
      console.log("Attaching remote stream to video element.");
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef.current]);


  // Simulated call duration timer
  useEffect(() => {
    if (currentCall?.status === 'in-progress' || currentCall?.status === 'answered') { // Or 'answered' if that's when connection is live
      setCallDuration(0); // Reset on new call
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentCall?.status]);

  const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
      console.log(isMuted ? "Unmuted" : "Muted");
    }
  };

  const handleToggleVideo = () => {
    if (currentCall?.type !== 'video') return; // Only for video calls
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
      console.log(isVideoEnabled ? "Video disabled" : "Video enabled");
    }
  };
  
  const getParticipantName = (participantInfo) => {
      if (!participantInfo) return "Connecting...";
      return participantInfo.displayName || participantInfo.email || "Participant";
  };

  if (!currentCall) { // Should be controlled by isCallWindowVisible from context typically
    return null; 
  }
  
  const otherPartyInfo = currentCall.isCaller ? currentCall.calleeInfo : currentCall.callerInfo;


  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-2xl relative overflow-hidden">
        {/* Call Info Header */}
        <div className="p-3 bg-gray-700 flex justify-between items-center">
            <div>
                <h2 className="text-lg font-semibold">
                    {currentCall.type === 'video' ? 'Video' : 'Audio'} Call with {getParticipantName(otherPartyInfo)}
                </h2>
                <p className="text-xs text-gray-400">
                    Status: {currentCall.status} | Duration: {formatDuration(callDuration)}
                </p>
            </div>
             {/* Simulated Network Quality */}
            <div className="text-xs text-green-400">Network: Good (Simulated)</div>
        </div>

        {/* Video Streams Area */}
        <div className="relative aspect-video bg-black">
          {/* Remote Video (Main View) */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
            // Poster could be a placeholder image or user avatar if video not flowing
            // poster={otherPartyInfo?.photoURL || 'https://via.placeholder.com/640x480?text=Remote+Video'}
          >
             {/* Fallback if video doesn't load or for audio call */}
             {!remoteStreamRef.current && <div className="w-full h-full flex items-center justify-center text-gray-500">{getParticipantName(otherPartyInfo)}'s {currentCall.type === 'video' ? 'video' : 'audio'}</div>}
          </video>

          {/* Local Video (Picture-in-Picture style) */}
          <div className="absolute bottom-4 right-4 w-1/4 max-w-[120px] md:max-w-[160px] aspect-video rounded-md overflow-hidden shadow-lg border-2 border-gray-700">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted // Important: local video should be muted to avoid echo
              className="w-full h-full object-cover bg-gray-700"
              // poster={currentUser?.photoURL || 'https://via.placeholder.com/160x90?text=Local+Video'}
            >
                {!localStreamRef.current && <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Your {currentCall.type === 'video' ? 'video' : 'audio'}</div>}
            </video>
          </div>
        </div>
        
        {/* Call Controls */}
        <div className="p-4 bg-gray-800 flex justify-center items-center space-x-3 md:space-x-4">
          <button
            onClick={handleToggleMute}
            className={`p-2 md:p-3 rounded-full focus:outline-none ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {/* Mic Icon (Placeholder) */}
            🎤 {isMuted && <span className="absolute h-full w-full flex items-center justify-center text-xl top-0 left-0">/</span>}
          </button>

          {currentCall.type === 'video' && (
            <button
              onClick={handleToggleVideo}
              className={`p-2 md:p-3 rounded-full focus:outline-none ${
                !isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title={!isVideoEnabled ? 'Enable Video' : 'Disable Video'}
            >
              {/* Video Icon (Placeholder) */}
              📹 {!isVideoEnabled && <span className="absolute h-full w-full flex items-center justify-center text-xl top-0 left-0">/</span>}
            </button>
          )}

          <button
            onClick={() => endCall()}
            className="p-2 md:p-3 px-4 md:px-6 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none"
            title="End Call"
          >
            📞 End Call
          </button>
        </div>
      </div>
    </div>
  );
}

CallWindow.propTypes = {
  // Props are implicitly handled by useCall context
};

export default CallWindow;
