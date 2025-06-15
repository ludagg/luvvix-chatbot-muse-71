import React, { useState } from 'react';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Globe, Palette, Database, Cloud } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import ProfilePage from './AccountPages/ProfilePage';
import SecurityPage from './AccountPages/SecurityPage';
import NotificationsPage from './AccountPages/NotificationsPage';
import PrivacyPage from './AccountPages/PrivacyPage';
import CloudPage from './AccountPages/CloudPage';

const MobileSettings = () => {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const settingsGroups = [
    {
      title: "Compte",
      items: [
        {
          icon: <User className="w-5 h-5" />,
          label: "Profil utilisateur",
          description: "Gérer vos informations personnelles",
          action: () => setCurrentPage('profile')
        },
        {
          icon: <Shield className="w-5 h-5" />,
          label: "Sécurité",
          description: "Mot de passe et authentification",
          action: () => setCurrentPage('security')
        },
        {
          icon: <Cloud className="w-5 h-5" />,
          label: "Connexions Cloud",
          description: "Gérer vos services de stockage",
          action: () => setCurrentPage('cloud')
        }
      ]
    },
    {
      title: "Préférences",
      items: [
        {
          icon: <Bell className="w-5 h-5" />,
          label: "Notifications",
          description: "Gérer vos alertes",
          action: () => setCurrentPage('notifications')
        },
        {
          icon: <Database className="w-5 h-5" />,
          label: "Confidentialité",
          description: "Contrôle de vos données",
          action: () => setCurrentPage('privacy')
        },
        {
          icon: <Globe className="w-5 h-5" />,
          label: "Langue et région",
          description: "Paramètres de localisation",
          action: () => toast({ title: "Bientôt disponible", description: "Cette fonctionnalité arrive prochainement" })
        },
        {
          icon: <Palette className="w-5 h-5" />,
          label: "Apparence",
          description: "Thème et personnalisation",
          action: () => toast({ title: "Bientôt disponible", description: "Cette fonctionnalité arrive prochainement" })
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: "Aide et support",
          description: "FAQ et assistance",
          action: () => toast({ title: "Aide", description: "Redirection vers le centre d'aide" })
        },
        {
          icon: <Settings className="w-5 h-5" />,
          label: "À propos de LuvviX OS",
          description: "Version et informations",
          action: () => toast({ title: "LuvviX OS", description: "Version 1.0.0 - Conçu par Ludovic Aggaï" })
        }
      ]
    }
  ];

  // Rendu conditionnel des pages
  if (currentPage === 'profile') {
    return <ProfilePage onBack={() => setCurrentPage(null)} />;
  }
  
  if (currentPage === 'security') {
    return <SecurityPage onBack={() => setCurrentPage(null)} />;
  }
  
  if (currentPage === 'cloud') {
    return <CloudPage onBack={() => setCurrentPage(null)} />;
  }
  
  if (currentPage === 'notifications') {
    return <NotificationsPage onBack={() => setCurrentPage(null)} />;
  }
  
  if (currentPage === 'privacy') {
    return <PrivacyPage onBack={() => setCurrentPage(null)} />;
  }

  return (
    <div className="flex-1 overflow-auto pb-20">
      {/* Profil utilisateur */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
            </h2>
            <p className="text-blue-100">{user?.email}</p>
            <p className="text-blue-200 text-sm">Membre LuvviX ID</p>
          </div>
        </div>
      </div>

      {/* Groupes de paramètres */}
      <div className="p-4 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {group.title}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Déconnexion */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center space-x-4 hover:bg-red-50 transition-colors text-red-600"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-medium">Se déconnecter</h4>
              <p className="text-sm text-red-500">Fermer votre session LuvviX</p>
            </div>
          </button>
        </div>
      </div>

      {/* Version et informations */}
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 mb-2">LuvviX OS v1.0.0</p>
        <p className="text-xs text-gray-400">© 2024 LuvviX. Tous droits réservés.</p>
        <p className="text-xs text-gray-400 mt-1">Conçu par Ludovic Aggaï</p>
      </div>
    </div>
  );
};

export default MobileSettings;
