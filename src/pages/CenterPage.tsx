
import React from 'react';
import Navbar from '@/components/Navbar';
import CenterSocialNetwork from '@/components/center/CenterSocialNetwork';

const CenterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <CenterSocialNetwork />
    </div>
  );
};

export default CenterPage;
