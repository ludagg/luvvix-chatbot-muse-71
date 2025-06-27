
import React from 'react';

interface EcosystemStatsProps {
  servicesCount: number;
}

const EcosystemStats: React.FC<EcosystemStatsProps> = ({ servicesCount }) => {
  return (
    <div className="px-4 mt-8">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Écosystème LuvviX</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{servicesCount}</div>
            <div className="text-sm text-purple-100">Applications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-purple-100">Disponibilité</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">∞</div>
            <div className="text-sm text-purple-100">Possibilités</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemStats;
