
import React from 'react';
import { 
  Grid3X3, 
  Bot, 
  Zap, 
  MessageCircle, 
  Camera, 
  Settings, 
  Users, 
  Map, 
  Globe, 
  Palette 
} from 'lucide-react';
import { Category } from './types';

export const categories: Category[] = [
  { id: 'all', label: 'Tous', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'ai', label: 'IA', icon: <Bot className="w-4 h-4" /> },
  { id: 'productivity', label: 'Productivité', icon: <Zap className="w-4 h-4" /> },
  { id: 'communication', label: 'Communication', icon: <MessageCircle className="w-4 h-4" /> },
  { id: 'media', label: 'Média', icon: <Camera className="w-4 h-4" /> },
  { id: 'utility', label: 'Utilitaires', icon: <Settings className="w-4 h-4" /> },
  { id: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> },
  { id: 'navigation', label: 'Navigation', icon: <Map className="w-4 h-4" /> },
  { id: 'internet', label: 'Internet', icon: <Globe className="w-4 h-4" /> },
  { id: 'lifestyle', label: 'Style de vie', icon: <Palette className="w-4 h-4" /> }
];
