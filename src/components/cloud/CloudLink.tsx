
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CloudLinkProps {
  icon: LucideIcon;
  to: string;
  label: string;
}

const CloudLink = ({ icon: Icon, to, label }: CloudLinkProps) => {
  const location = useLocation();
  
  // Vérifie si le chemin actuel correspond au lien ou est un sous-chemin de celui-ci
  const isActive = location.pathname === to || 
                   (to !== '/cloud' && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`flex items-center p-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default CloudLink;
