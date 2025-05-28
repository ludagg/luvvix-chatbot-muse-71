import React from 'react';
import PropTypes from 'prop-types';
import { useCall } from '../../../contexts/CallContext'; // Adjust path

function IncomingCallModal() {
  const { incomingCall, answerCall, declineCall } = useCall();

  if (!incomingCall) {
    return null;
  }

  const { callerInfo, type } = incomingCall;
  const callerName = callerInfo?.displayName || callerInfo?.email || 'Unknown Caller';
  const callerPhoto = callerInfo?.photoURL || 'https://via.placeholder.com/100'; // Default placeholder

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Incoming {type} Call</h2>
        
        <img 
          src={callerPhoto} 
          alt={`${callerName}'s avatar`}
          className="w-24 h-24 rounded-full mx-auto my-4 object-cover border-2 border-gray-200"
        />
        
        <p className="text-gray-700 mb-1">
          <span className="font-medium">{callerName}</span> is calling...
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Type: <span className="capitalize">{type} call</span>
        </p>

        {incomingCall.status !== 'pending' && (
             <p className="text-yellow-600 text-sm mb-3">Call status: {incomingCall.status} (e.g., cancelled by caller)</p>
        )}

        <div className="flex justify-around space-x-3">
          <button
            onClick={answerCall}
            disabled={incomingCall.status !== 'pending'} // Can only answer if still pending
            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            Answer
          </button>
          <button
            onClick={declineCall}
            className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

IncomingCallModal.propTypes = {
  // Props are implicitly handled by useCall context
};

export default IncomingCallModal;
