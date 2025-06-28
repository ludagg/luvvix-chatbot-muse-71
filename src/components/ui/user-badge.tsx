
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Shield, Heart, Rocket, Award, Gem } from 'lucide-react';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline' | 'luvvix';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
}

interface UserBadgeProps {
  badge: UserBadge;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const getBadgeIcon = (iconName: string, size: number = 12) => {
  const icons: Record<string, React.ReactNode> = {
    crown: <Crown className={`w-${size/4} h-${size/4}`} />,
    star: <Star className={`w-${size/4} h-${size/4}`} />,
    zap: <Zap className={`w-${size/4} h-${size/4}`} />,
    shield: <Shield className={`w-${size/4} h-${size/4}`} />,
    heart: <Heart className={`w-${size/4} h-${size/4}`} />,
    rocket: <Rocket className={`w-${size/4} h-${size/4}`} />,
    award: <Award className={`w-${size/4} h-${size/4}`} />,
    gem: <Gem className={`w-${size/4} h-${size/4}`} />
  };
  return icons[iconName] || <Star className={`w-${size/4} h-${size/4}`} />;
};

const UserBadgeComponent: React.FC<UserBadgeProps> = ({
  badge,
  size = 'sm',
  showTooltip = false
}) => {
  const badgeContent = (
    <Badge 
      variant={badge.color}
      className={`inline-flex items-center gap-1 ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}
    >
      {getBadgeIcon(badge.icon, size === 'sm' ? 12 : 16)}
      <span className="font-medium">{badge.name}</span>
    </Badge>
  );

  if (showTooltip) {
    return (
      <div className="relative group">
        {badgeContent}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {badge.description}
        </div>
      </div>
    );
  }

  return badgeContent;
};

export default UserBadgeComponent;
