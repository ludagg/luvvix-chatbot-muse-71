
import React from 'react';
import Navbar from '@/components/Navbar';
import CodeStudio from '@/components/CodeStudio';

const CodeStudioPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 flex-1">
      <CodeStudio />
    </div>
</div>
  );
};

export default CodeStudioPage;
