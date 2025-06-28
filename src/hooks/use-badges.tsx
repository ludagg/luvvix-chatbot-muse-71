
import { useState, useEffect } from 'react';
import { UserBadge } from '@/components/ui/user-badge';
import { useAuth } from '@/hooks/useAuth';

const AVAILABLE_BADGES: UserBadge[] = [
  {
    id: 'pioneer',
    name: 'Pionnier',
    description: 'Premier utilisateur de LuvviX',
    icon: 'crown',
    color: 'luvvix',
    rarity: 'legendary'
  },
  {
    id: 'ai_explorer',
    name: 'IA Explorer',
    description: 'Utilisé 5+ services IA',
    icon: 'zap',
    color: 'secondary',
    rarity: 'epic'
  },
  {
    id: 'social_butterfly',
    name: 'Social',
    description: 'Actif sur LuvviX Center',
    icon: 'heart',
    color: 'default',
    rarity: 'rare'
  },
  {
    id: 'productivity_master',
    name: 'Productif',
    description: 'Score de productivité élevé',
    icon: 'rocket',
    color: 'secondary',
    rarity: 'epic'
  },
  {
    id: 'early_adopter',
    name: 'Visionnaire',
    description: 'Adopté LuvviX en early access',
    icon: 'star',
    color: 'luvvix',
    rarity: 'legendary'
  },
  {
    id: 'learning_enthusiast',
    name: 'Apprenant',
    description: 'Cours complétés sur LuvviX Learn',
    icon: 'award',
    color: 'default',
    rarity: 'common'
  },
  {
    id: 'cloud_master',
    name: 'Cloud Expert',
    description: 'Maîtrise du stockage cloud',
    icon: 'shield',
    color: 'secondary',
    rarity: 'rare'
  },
  {
    id: 'community_helper',
    name: 'Entraide',
    description: 'Aide la communauté LuvviX',
    icon: 'gem',
    color: 'luvvix',
    rarity: 'epic'
  }
];

export const useBadges = () => {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAndAwardBadges();
    }
  }, [user]);

  const checkAndAwardBadges = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Simulate badge checking logic
      const earnedBadges: UserBadge[] = [];

      // Check for Pioneer badge (early user)
      const userCreated = new Date(user.created_at || Date.now());
      const earlyAdopterCutoff = new Date('2024-06-01');
      if (userCreated < earlyAdopterCutoff) {
        const pioneerBadge = { 
          ...AVAILABLE_BADGES.find(b => b.id === 'pioneer')!,
          earnedAt: user.created_at 
        };
        earnedBadges.push(pioneerBadge);
      }

      // Check for AI Explorer badge (simulate service usage)
      const aiExplorerBadge = { 
        ...AVAILABLE_BADGES.find(b => b.id === 'ai_explorer')!,
        earnedAt: new Date().toISOString()
      };
      earnedBadges.push(aiExplorerBadge);

      // Check for Learning Enthusiast badge
      const learningBadge = { 
        ...AVAILABLE_BADGES.find(b => b.id === 'learning_enthusiast')!,
        earnedAt: new Date().toISOString()
      };
      earnedBadges.push(learningBadge);

      setUserBadges(earnedBadges);
    } catch (error) {
      console.error('Error checking badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardBadge = async (badgeId: string) => {
    const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
    if (badge && !userBadges.find(b => b.id === badgeId)) {
      const newBadge = { ...badge, earnedAt: new Date().toISOString() };
      setUserBadges(prev => [...prev, newBadge]);
      
      // In real implementation, save to database
      return newBadge;
    }
    return null;
  };

  const getBadgesByRarity = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    return userBadges.filter(badge => badge.rarity === rarity);
  };

  const getTopBadges = (limit: number = 3) => {
    const rarityWeight = { legendary: 4, epic: 3, rare: 2, common: 1 };
    return userBadges
      .sort((a, b) => rarityWeight[b.rarity] - rarityWeight[a.rarity])
      .slice(0, limit);
  };

  return {
    userBadges,
    loading,
    awardBadge,
    getBadgesByRarity,
    getTopBadges,
    availableBadges: AVAILABLE_BADGES
  };
};
