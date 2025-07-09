
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Globe, BookOpen, Briefcase, Heart, Gamepad2, Car, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsPreferences {
  categories: string[];
  sources: string[];
  keywords: string[];
  frequency: 'realtime' | 'daily' | 'weekly';
  language: string;
  location: boolean;
}

interface AINewsPreferencesProps {
  onPreferencesSet: (preferences: NewsPreferences) => void;
  onSkip: () => void;
}

const AINewsPreferences: React.FC<AINewsPreferencesProps> = ({ onPreferencesSet, onSkip }) => {
  const [preferences, setPreferences] = useState<NewsPreferences>({
    categories: [],
    sources: [],
    keywords: [],
    frequency: 'daily',
    language: 'fr',
    location: true
  });
  
  const [customKeyword, setCustomKeyword] = useState('');
  const { toast } = useToast();

  const categories = [
    { id: 'technology', name: 'Technologie', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'business', name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'world', name: 'International', icon: <Globe className="w-4 h-4" /> },
    { id: 'sports', name: 'Sports', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'health', name: 'Santé', icon: <Heart className="w-4 h-4" /> },
    { id: 'science', name: 'Sciences', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'entertainment', name: 'Divertissement', icon: <Coffee className="w-4 h-4" /> },
    { id: 'automotive', name: 'Automobile', icon: <Car className="w-4 h-4" /> }
  ];

  const sources = [
    'Le Monde', 'Le Figaro', 'Liberation', 'Les Echos', 'La Tribune',
    'France24', 'RFI', 'Europe1', 'RTL', 'BFM TV',
    'TechCrunch', 'Wired', 'The Verge', 'Ars Technica'
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSourceToggle = (source: string) => {
    setPreferences(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  const addKeyword = () => {
    if (customKeyword.trim() && !preferences.keywords.includes(customKeyword.trim())) {
      setPreferences(prev => ({
        ...prev,
        keywords: [...prev.keywords, customKeyword.trim()]
      }));
      setCustomKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setPreferences(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const savePreferences = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour sauvegarder vos préférences',
          variant: 'destructive'
        });
        return;
      }

      // Sauvegarder dans la base de données
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.user.id,
          news_preferences: preferences
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: 'Préférences sauvegardées',
        description: 'Vos préférences d\'actualités ont été configurées avec succès'
      });

      onPreferencesSet(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos préférences',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Configuration IA des Actualités
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Personnalisez vos actualités pour une expérience sur mesure
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Catégories */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Catégories d'intérêt</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    preferences.categories.includes(category.id)
                      ? 'bg-purple-50 border-purple-200 dark:bg-purple-950/20'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm font-medium">{category.name}</span>
                  <Checkbox
                    checked={preferences.categories.includes(category.id)}
                    className="ml-auto"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sources préférées */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Sources préférées (optionnel)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {sources.map((source) => (
                <div
                  key={source}
                  onClick={() => handleSourceToggle(source)}
                  className={`flex items-center justify-between p-2 rounded-md border cursor-pointer text-sm ${
                    preferences.sources.includes(source)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>{source}</span>
                  <Checkbox checked={preferences.sources.includes(source)} />
                </div>
              ))}
            </div>
          </div>

          {/* Mots-clés personnalisés */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Mots-clés personnalisés</Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ajouter un mot-clé..."
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} variant="outline" size="sm">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeKeyword(keyword)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Fréquence */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Fréquence des mises à jour</Label>
            <Select
              value={preferences.frequency}
              onValueChange={(value: 'realtime' | 'daily' | 'weekly') =>
                setPreferences(prev => ({ ...prev, frequency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Temps réel</SelectItem>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options avancées */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Options avancées</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="location"
                checked={preferences.location}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, location: !!checked }))
                }
              />
              <Label htmlFor="location" className="text-sm">
                Utiliser ma localisation pour les actualités locales
              </Label>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button onClick={savePreferences} className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Configurer l'IA
            </Button>
            <Button onClick={onSkip} variant="outline">
              Plus tard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AINewsPreferences;
