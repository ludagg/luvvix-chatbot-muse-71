
import React from 'react';
import { 
  Cpu, 
  MessageCircle, 
  Cloud, 
  Smartphone, 
  Users, 
  Settings,
  Phone,
  UserPlus
} from 'lucide-react';
import { Category } from './types';

export const categories: Category[] = [
  {
    id: 'all',
    label: 'Tous',
    icon: React.createElement(Cpu)
  },
  {
    id: 'ai',
    label: 'IA',
    icon: React.createElement(Cpu)
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: React.createElement(MessageCircle)
  },
  {
    id: 'social',
    label: 'Social',
    icon: React.createElement(Users)
  },
  {
    id: 'productivity',
    label: 'Productivité',
    icon: React.createElement(Cloud)
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: React.createElement(Smartphone)
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: React.createElement(Settings)
  }
];
