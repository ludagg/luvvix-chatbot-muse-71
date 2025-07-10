
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, User, Key, Moon, Sun } from 'lucide-react';
import LanguageSettings from './LanguageSettings';

const MobileSettings = () => {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
  });

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté de votre compte.",
      });
    }
  };

  const handleProfileUpdate = async () => {
    setUpdatingProfile(true);
    try {
      // For now, we'll just show a success message
      // In a real implementation, you would update the user profile here
      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 overflow-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-500" />
          Paramètres
        </h1>
        <p className="text-gray-600">Gérez votre compte et vos préférences</p>
      </div>

      <div className="space-y-6">
        {/* Paramètres de langue */}
        <LanguageSettings />

        {/* Section Profil */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <User className="w-5 h-5 text-blue-600" />
              Profil
            </CardTitle>
            <CardDescription className="text-gray-600">
              Gérez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                name="fullName"
                type="text"
                value={profileData.fullName}
                onChange={handleChange}
                placeholder="Votre nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                disabled
              />
            </div>
            <Button onClick={handleProfileUpdate} disabled={updatingProfile}>
              {updatingProfile ? "Mise à jour..." : "Mettre à jour le profil"}
            </Button>
          </CardContent>
        </Card>

        {/* Section Sécurité */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Key className="w-5 h-5 text-orange-600" />
              Sécurité
            </CardTitle>
            <CardDescription className="text-gray-600">
              Gérez votre mot de passe et la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Vous serez bientôt en mesure de modifier votre mot de passe ici.
            </p>
            <Button variant="outline" disabled>
              Modifier le mot de passe (bientôt disponible)
            </Button>
          </CardContent>
        </Card>

        {/* Section Apparence */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Moon className="w-5 h-5 text-purple-600" />
              Apparence
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choisissez votre mode d'apparence préféré
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Mode sombre</Label>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={(checked) => setIsDarkMode(checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Déconnexion */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Sun className="w-5 h-5 text-yellow-600" />
              Déconnexion
            </CardTitle>
            <CardDescription className="text-gray-600">
              Déconnectez-vous de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileSettings;
