
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CenterLayout from './CenterLayout';
import LoginPrompt from './LoginPrompt';

const CenterSocialNetwork = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return <CenterLayout />;
};

export default CenterSocialNetwork;
