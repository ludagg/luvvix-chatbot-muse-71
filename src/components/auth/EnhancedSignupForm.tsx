import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User, Mail, Lock, Globe, Calendar, Users, Camera, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  bio: string;
  age: string;
  gender: string;
  country: string;
  avatarFile?: File;
}

const COUNTRIES = [
  'France', 'Canada', 'Belgique', 'Suisse', 'Maroc', 'Tunisie', 
  'Algérie', 'Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'Madagascar',
  'Mali', 'Burkina Faso', 'Niger', 'Guinée', 'Bénin', 'Togo',
  'République démocratique du Congo', 'Gabon', 'Congo', 'Autre'
];

const GENDERS = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
  { value: 'non_specifie', label: 'Préfère ne pas préciser' }
];

const EnhancedSignupForm = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    bio: '',
    age: '',
    gender: '',
    country: '',
  });

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatarFile: file }));
      
      // Créer une preview
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      
      // Note: Ici vous devrez implémenter l'upload vers votre système de stockage
      // Pour l'instant, on retourne une URL fictive
      return `https://storage.luvvix.com/avatars/${fileName}`;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (!formData.fullName || !formData.age || !formData.gender || !formData.country) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Préparer les métadonnées utilisateur
      let avatarUrl = '';
      if (formData.avatarFile) {
        // Upload temporaire - vous devrez implémenter l'upload réel
        avatarUrl = await uploadAvatar(formData.avatarFile, 'temp') || '';
      }

      const userMetadata = {
        full_name: formData.fullName,
        bio: formData.bio,
        age: formData.age,
        gender: formData.gender,
        country: formData.country,
        avatar_url: avatarUrl
      };

      const success = await signUp(formData.email, formData.password, userMetadata);
      
      if (success) {
        toast({
          title: "Compte créé avec succès !",
          description: "Bienvenue sur LuvviX ! Vous pouvez maintenant connecter votre Dropbox.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Erreur lors de la création du compte",
        description: "Veuillez réessayer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDropboxConnect = () => {
    const clientId = 'n996hgcg16xp1pu';
    const redirectUri = `${window.location.origin}/auth/dropbox/callback`;
    const scope = 'files.content.write files.content.read files.metadata.read';
    
    const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}`;
    
    toast({
      title: "Connexion Dropbox",
      description: "Redirection vers Dropbox pour l'autorisation...",
    });
    
    window.location.href = authUrl;
  };

  if (step === 1) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Informations de connexion
          </CardTitle>
          <CardDescription>
            Créez votre compte LuvviX ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button 
            onClick={() => setStep(2)} 
            className="w-full"
            disabled={!formData.email || !formData.password || !formData.confirmPassword}
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Complétez votre profil pour rejoindre la communauté
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo de profil */}
          <div className="space-y-2">
            <Label>Photo de profil</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir une photo
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Votre nom complet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (pour le réseau social)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Parlez-nous de vous..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Âge *</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="25"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Sexe *</Label>
              <Select onValueChange={(value) => handleInputChange('gender', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map(gender => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Pays *</Label>
            <Select onValueChange={(value) => handleInputChange('country', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner votre pays" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Retour
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Continuer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3 - Connexion Dropbox
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Connexion cloud
        </CardTitle>
        <CardDescription>
          Connectez votre Dropbox pour accéder au stockage cloud
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                <path fill="currentColor" d="M7.71,3.5L1.15,8L7.71,12.5L12.39,8L7.71,3.5M21.15,8L14.59,3.5L9.91,8L14.59,12.5L21.15,8M14.59,14.5L21.15,19L12.39,19L7.71,14.5L14.59,14.5M7.71,14.5L1.15,19L9.91,19L14.59,14.5L7.71,14.5Z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Dropbox</h3>
              <p className="text-sm text-gray-600">Stockage cloud sécurisé</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-4">
            Pour utiliser LuvviX Cloud, vous devez connecter votre compte Dropbox. Cela vous permettra de gérer vos fichiers de manière sécurisée.
          </p>
          
          <Button 
            onClick={handleDropboxConnect}
            className="w-full mb-3"
            variant="outline"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Connecter Dropbox
          </Button>
          
          <p className="text-xs text-gray-500">
            Vous pourrez également connecter Dropbox plus tard dans les paramètres.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Retour
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer le compte'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSignupForm;
