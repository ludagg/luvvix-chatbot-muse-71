
import React from 'react';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  bgColor: string;
  badge?: string;
  category: string;
  component?: React.ComponentType<{ onBack: () => void }>;
  action?: () => void;
}

export interface Category {
  id: string;
  label: string;
  icon: React.ReactElement;
}

export type MobileView = 'home' | 'services' | 'assistant' | 'cloud' | 'profile' | 'settings' | 'search' | 'calendar' | 'forms' | 'translate' | 'weather' | 'center';
