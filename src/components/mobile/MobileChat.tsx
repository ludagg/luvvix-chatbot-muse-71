
import React from 'react';
import MobileSecureChat from './MobileSecureChat';

interface MobileChatProps {
  showBottomNav?: boolean;
}

const MobileChat = ({ showBottomNav = true }: MobileChatProps) => {
  return (
    <div className="h-full">
      <MobileSecureChat showBottomNav={showBottomNav} />
    </div>
  );
};

export default MobileChat;
