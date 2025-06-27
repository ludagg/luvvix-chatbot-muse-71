
import React from 'react';
import { Service } from './types';

interface ServiceCardProps {
  service: Service;
  onServiceClick: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onServiceClick }) => {
  return (
    <button
      onClick={() => onServiceClick(service)}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform text-left relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className={`w-14 h-14 ${service.bgColor} rounded-2xl flex items-center justify-center mb-3 text-white shadow-lg`}>
          {service.icon}
        </div>
        
        {service.badge && (
          <div className="absolute top-0 right-0">
            <span className={`text-white text-xs px-2 py-1 rounded-full ${
              service.badge === 'Nouveau' ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {service.badge}
            </span>
          </div>
        )}
        
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {service.name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      </div>
    </button>
  );
};

export default ServiceCard;
