
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, BookOpen, Clock, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { COURSE_CATEGORIES, DIFFICULTY_LEVELS } from "@/types/course";

const COURSE_TEMPLATES = [
  {
    id: 'marketing-digital',
    title: 'Marketing Digital Avancé',
    description: 'Maîtrisez les stratégies marketing modernes',
    category: 'Marketing Digital',
    difficulty: 'intermediate',
    duration: 480,
    objectives: ['SEO/SEM', 'Réseaux sociaux', 'Email marketing', 'Analytics']
  },
  {
    id: 'ai-business',
    title: 'IA pour le Business',
    description: 'Intégrez l\'IA dans votre entreprise',
    category: 'Intelligence Artificielle',
    difficulty: 'beginner',
    duration: 360,
    objectives: ['Comprendre l\'IA', 'Outils IA', 'Automatisation', 'ROI IA']
  },
  {
    id: 'administration-efficace',
    title: 'Administration Moderne',
    description: 'Techniques d\'administration efficaces',
    category: 'Administration & Gestion',
    difficulty: 'beginner',
    duration: 300,
    objectives: ['Gestion du temps', 'Outils numériques', 'Communication', 'Organisation']
  },
  {
    id: 'entrepreneuriat',
    title: 'Lancer son Business',
    description: 'De l\'idée au succès entrepreneurial',
    category: 'Business & Entrepreneuriat',
    difficulty: 'intermediate',
    duration: 600,
    objectives: ['Business plan', 'Financement', 'Marketing', 'Gestion']
  }
];

const NewCourseCreator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState('');

  const handleGenerateFromTemplate = async (templateId: string) => {
    const template = COURSE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setIsGenerating(true);
    
    try {
      // Simuler la génération de cours
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`Cours "${template.title}" généré avec succès !`);
      
      // Ici on pourrait rediriger vers le cours généré
    } catch (error) {
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustom = async () => {
    if (!customTitle || !customCategory || !customDifficulty) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simuler la génération de cours personnalisé
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast.success(`Cours "${customTitle}" généré avec succès !`);
      
      // Reset form
      setCustomTitle('');
      setCustomDescription('');
      setCustomCategory('');
      setCustomDifficulty('');
    } catch (error) {
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <Wand2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
          <h3 className="text-xl font-semibold">Génération en cours...</h3>
          <p className="text-gray-600">L'IA LuvviX crée votre cours personnalisé</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Templates prédéfinis */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Cours recommandés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURSE_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{template.category}</Badge>
                  <Badge variant={template.difficulty === 'beginner' ? 'default' : 'secondary'}>
                    {template.difficulty === 'beginner' ? 'Débutant' : 'Intermédiaire'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{Math.round(template.duration / 60)}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    <span>{template.objectives.length} objectifs</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-gray-700">Objectifs :</p>
                  <div className="flex flex-wrap gap-1">
                    {template.objectives.map((obj, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {obj}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleGenerateFromTemplate(template.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isGenerating}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Générer ce cours
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Création personnalisée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Créer un cours personnalisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre du cours *</label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Maîtriser les réseaux sociaux"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Catégorie *</label>
              <Select value={customCategory} onValueChange={setCustomCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Décrivez le contenu et les objectifs du cours..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Niveau de difficulté *</label>
            <Select value={customDifficulty} onValueChange={setCustomDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le niveau" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === 'beginner' ? 'Débutant' : level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateCustom}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isGenerating}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Générer le cours personnalisé
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewCourseCreator;
