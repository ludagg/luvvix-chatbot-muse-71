import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext'; // Adjust path
import {
  createCall,
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  listenToCallUpdates,
  listenToIceCandidates,
  updateCallStatus,
  listenForIncomingCalls,
  cleanupIceCandidates
} from '../services/callService'; // Adjust path
import { getUserProfile } from '../services/profileService'; // Adjust path

const CallContext = createContext();

export function useCall() {
  return useContext(CallContext);
}

// Configuration for RTCPeerConnection (can be null if not using STUN/TURN for local dev)
const peerConnectionConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add TURN servers here if needed for NAT traversal
  ],
};

export function CallProvider({ children }) {
  const { currentUser } = useAuth();
  const [currentCall, setCurrentCall] = useState(null); // { callId, type, status, localStream, remoteStream, peerConnection, callerInfo, calleeInfo }
  const [incomingCall, setIncomingCall] = useState(null); // Data of an incoming call for the modal
  const [isCallWindowVisible, setIsCallWindowVisible] = useState(false);
  const [callError, setCallError] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  
  const callUpdatesUnsubscribeRef = useRef(null);
  const iceCandidatesUnsubscribeRef = useRef(null);
  const incomingCallListenerUnsubscribeRef = useRef(null);


  // Helper to reset call state
  const resetCallState = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null; // Remote stream is managed by peer connection

    setCurrentCall(null);
    setIncomingCall(null); // Also clear incoming call if any was active
    setIsCallWindowVisible(false);
    setCallError(null);
    
    if (callUpdatesUnsubscribeRef.current) callUpdatesUnsubscribeRef.current();
    if (iceCandidatesUnsubscribeRef.current) iceCandidatesUnsubscribeRef.current();
    // Do not unsubscribe incomingCallListener here, it should always be active for logged-in user

  }, []);


  // SIMULATED/SIMPLIFIED getUserMedia
  const getSimulatedUserMedia = async (type = 'video') => {
    console.log(`Simulating getUserMedia for ${type} call.`);
    // In a real app: const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    // For simulation, we don't actually get media to avoid permissions and complexity.
    // We'll return a dummy object that might be enough for structure, or rely on UI placeholders.
    const stream = new MediaStream(); // Create a dummy MediaStream
    // Add a dummy track to make it seem like there's something
    // This is very basic. Real tracks are needed for RTCPeerConnection to send something.
    // For a deeper simulation, one might use a MediaStreamTrack from a canvas or oscillator.
    if (type === 'video') {
        // Create a dummy video track (e.g., from a canvas) - too complex for now
    }
    // Create a dummy audio track (e.g., from an oscillator) - too complex for now
    
    localStreamRef.current = stream; // Store "simulated" stream
    return stream;
  };


  // Initialize RTCPeerConnection
  const initializePeerConnection = useCallback((callId, isCaller) => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    
    const pc = new RTCPeerConnection(peerConnectionConfig);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && currentUser) {
        console.log("Sending ICE candidate:", event.candidate);
        sendIceCandidate(callId, currentUser.uid, event.candidate).catch(setCallError);
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      remoteStreamRef.current = event.streams[0];
      // Update currentCall or directly set a state for remote video element srcObject
      setCurrentCall(prev => prev ? ({ ...prev, remoteStream: event.streams[0] }) : null);
    };

    // Add local tracks if stream exists (it should by this point if getUserMedia was called)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current);
        } catch (e) {
          console.error("Error adding track:", e);
        }
      });
    }
    
    return pc;
  }, [currentUser]);


  // Start a new call (caller)
  const startCall = useCallback(async (calleeId, type, calleeInfo) => {
    if (!currentUser) return setCallError("User not logged in.");
    resetCallState(); // Reset any previous call state
    setCallError(null);

    try {
      console.log(`Starting ${type} call to ${calleeId}`);
      const callId = await createCall(currentUser.uid, calleeId, type);
      const callerProfile = await getUserProfile(currentUser.uid);

      setCurrentCall({
        callId,
        type,
        status: 'pending',
        isCaller: true,
        callerInfo: callerProfile, 
        calleeInfo, // Passed in, or fetch if needed
        localStream: null, // Will be set by getUserMedia
        remoteStream: null,
      });
      setIsCallWindowVisible(true);

      const stream = await getSimulatedUserMedia(type); // Or real getUserMedia
      setCurrentCall(prev => prev ? ({ ...prev, localStream: stream }) : null);
      
      const pc = initializePeerConnection(callId, true);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendOffer(callId, offer);
      console.log("Offer sent for callId:", callId);

      // Listen for answer and ICE candidates from callee
      callUpdatesUnsubscribeRef.current = listenToCallUpdates(callId, async (callData) => {
        if (!callData) {
            console.warn(`Call ${callId} data is null, possibly deleted or ended.`);
            // If call was active and now null, it means it was likely deleted/ended abruptly
            if (currentCall && currentCall.callId === callId && currentCall.status !== 'ended' && currentCall.status !== 'declined') {
                setCallError("Call ended unexpectedly or was deleted.");
                await endCall(true); // Force end from this side
            }
            return;
        }

        setCurrentCall(prev => prev ? ({ ...prev, status: callData.status, offer: callData.offer, answer: callData.answer }) : null);

        if (callData.answer && pc.signalingState !== 'stable') {
           console.log("Received answer:", callData.answer);
           try {
            await pc.setRemoteDescription(new RTCSessionDescription(callData.answer));
           } catch (e) { console.error("Error setting remote description for answer:", e); setCallError("Failed to process answer."); }
        }
        if (callData.status === 'declined' || callData.status === 'ended') {
          console.log(`Call ${callId} was ${callData.status}.`);
          await endCall(true); // Pass true if already ended by other party
        }
      });

      iceCandidatesUnsubscribeRef.current = listenToIceCandidates(callId, calleeId, (candidate) => {
        console.log("Received ICE candidate from callee:", candidate);
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {
            console.error("Error adding received ICE candidate (callee):", e);
            setCallError("Error with network setup (ICE candidate).");
        });
      });

    } catch (error) {
      console.error("Error starting call:", error);
      setCallError(error.message || "Failed to start call.");
      resetCallState();
    }
  }, [currentUser, resetCallState, initializePeerConnection]);


  // Answer an incoming call (callee)
  const answerCall = useCallback(async () => {
    if (!incomingCall || !currentUser) return setCallError("No incoming call to answer or user not logged in.");
    
    const { callId, type, offer, callerId } = incomingCall;
    setCallError(null);
    // Incoming call is now being handled, clear it from modal queue
    const callerInfo = await getUserProfile(callerId); // Fetch caller profile
    const calleeInfo = await getUserProfile(currentUser.uid);

    setIncomingCall(null); 
    setCurrentCall({ 
        callId, 
        type, 
        status: 'answering', 
        isCaller: false, 
        callerInfo, 
        calleeInfo,
        offer, // Store offer for reference
        localStream: null, 
        remoteStream: null 
    });
    setIsCallWindowVisible(true);

    try {
      const stream = await getSimulatedUserMedia(type);
      setCurrentCall(prev => prev ? ({ ...prev, localStream: stream }) : null);

      const pc = initializePeerConnection(callId, false);
      
      console.log("Setting remote description from offer:", offer);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendAnswer(callId, answer);
      console.log("Answer sent for callId:", callId);
      await updateCallStatus(callId, 'in-progress'); // Or 'answered' was set by sendAnswer

      // Listen for status changes (e.g., caller ending call) and ICE candidates from caller
      callUpdatesUnsubscribeRef.current = listenToCallUpdates(callId, (callData) => {
         if (!callData) { // Call document deleted
            console.warn(`Call ${callId} data is null (answered path).`);
            if (currentCall && currentCall.callId === callId && currentCall.status !== 'ended') {
                setCallError("Call ended unexpectedly.");
                endCall(true);
            }
            return;
        }
        setCurrentCall(prev => prev ? ({ ...prev, status: callData.status }) : null);
        if (callData.status === 'ended') {
          console.log(`Call ${callId} was ended by caller.`);
          endCall(true);
        }
      });

      iceCandidatesUnsubscribeRef.current = listenToIceCandidates(callId, callerId, (candidate) => {
        console.log("Received ICE candidate from caller:", candidate);
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {
            console.error("Error adding received ICE candidate (caller):", e);
            setCallError("Error with network setup (ICE candidate).");
        });
      });

    } catch (error) {
      console.error("Error answering call:", error);
      setCallError(error.message || "Failed to answer call.");
      await updateCallStatus(callId, 'failed');
      resetCallState();
    }
  }, [currentUser, incomingCall, resetCallSate, initializePeerConnection]);

  // Decline an incoming call
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;
    console.log("Declining call:", incomingCall.id);
    try {
      await updateCallStatus(incomingCall.id, 'declined');
      // Optional: cleanup ICE candidates if any were prematurely created for this callId (unlikely for callee before accept)
    } catch (error) {
      console.error("Error declining call:", error);
      setCallError(error.message || "Failed to decline call.");
    }
    setIncomingCall(null); // Clear the incoming call from UI
    // No need to call resetCallState as no local media/peer connection was established for this call yet
  }, [incomingCall]);


  // End the current call (can be called by either party)
  const endCall = useCallback(async (alreadyEndedByRemote = false) => {
    if (!currentCall && !peerConnectionRef.current) { // If no current call or PC, nothing to end from this side
        resetCallState(); // Ensure full cleanup
        return;
    }
    
    const callIdToEnd = currentCall ? currentCall.callId : (peerConnectionRef.current && peerConnectionRef.current.callIdAssociated); // Bit of a hack for callId if currentCall is cleared early

    console.log(`Ending call: ${callIdToEnd}`);
    
    if (callIdToEnd && !alreadyEndedByRemote) {
      try {
        await updateCallStatus(callIdToEnd, 'ended');
      } catch (error) {
        console.error("Error updating call status to ended:", error);
        // Still proceed with local cleanup
      }
    }
    
    // Cleanup ICE candidates on Firestore (best effort)
    if (callIdToEnd) {
        cleanupIceCandidates(callIdToEnd).catch(err => console.warn("Failed to cleanup ICE candidates on call end:", err));
    }
    
    resetCallState(); // This closes PC, stops streams, clears state
  }, [currentCall, resetCallState]);


  // Listen for incoming calls for the current user
  useEffect(() => {
    if (currentUser?.uid && !incomingCallListenerUnsubscribeRef.current) {
      console.log(`Listening for incoming calls for user: ${currentUser.uid}`);
      incomingCallListenerUnsubscribeRef.current = listenForIncomingCalls(currentUser.uid, async (callData) => {
        if (callData && callData.status === 'pending') {
          // Avoid setting if already handling a call or another incoming call
          if (currentCall || incomingCall) {
            console.warn("Already in a call or processing an incoming call. Ignoring new pending call:", callData.id);
            // Optionally, auto-decline this new call if busy
            // await updateCallStatus(callData.id, 'declined'); 
            return;
          }
          console.log("Incoming call received:", callData);
          const callerProfile = await getUserProfile(callData.callerId);
          setIncomingCall({...callData, callerInfo: callerProfile});
        } else if (!callData && incomingCall) {
          // If the current incomingCall is no longer pending (e.g., cancelled by caller before UI interaction)
          // This part needs careful handling: if callData becomes null, it means no *new* pending call.
          // It does not mean the *current* incomingCall in state is gone.
          // We might need to check if the existing incomingCall.id still has 'pending' status if callData is null.
        }
      });
    }
    // Cleanup listener on unmount or user change
    return () => {
      if (incomingCallListenerUnsubscribeRef.current) {
        console.log("Stopping listener for incoming calls.");
        incomingCallListenerUnsubscribeRef.current();
        incomingCallListenerUnsubscribeRef.current = null;
      }
    };
  }, [currentUser, currentCall, incomingCall]); // Rerun if user changes, or if in a call (to avoid new popups)


  const contextValue = {
    currentCall,
    incomingCall,
    isCallWindowVisible,
    callError,
    localStreamRef, // Expose refs for UI to attach streams
    remoteStreamRef,
    startCall,
    answerCall,
    declineCall,
    endCall,
    // Add mute/unmute, video toggle functions here later
  };

  return <CallContext.Provider value={contextValue}>{children}</CallContext.Provider>;
}
