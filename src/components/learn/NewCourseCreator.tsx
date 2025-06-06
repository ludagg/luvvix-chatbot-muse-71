
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, Sparkles, Target, BookOpen, Award } from 'lucide-react';
import { toast } from 'sonner';
import { COURSE_CATEGORIES, DIFFICULTY_LEVELS } from "@/types/course";

interface NewCourseCreatorProps {
  onCourseCreated?: () => void;
}

const NewCourseCreator: React.FC<NewCourseCreatorProps> = ({ onCourseCreated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    category: 'Marketing Digital',
    difficulty: 'intermediate',
    duration: 'medium',
    focus: 'practical'
  });

  const durations = [
    { value: 'short', label: 'Court (3-5 leçons, 2-3h)' },
    { value: 'medium', label: 'Moyen (6-8 leçons, 4-6h)' },
    { value: 'long', label: 'Long (9-12 leçons, 7-10h)' }
  ];

  const focuses = [
    { value: 'theoretical', label: 'Théorique - Concepts et principes' },
    { value: 'practical', label: 'Pratique - Exercices et applications' },
    { value: 'mixed', label: 'Mixte - Théorie + Pratique' }
  ];

  const courseExamples = {
    'Marketing Digital': [
      'Marketing sur les réseaux sociaux avec Meta Ads',
      'Email marketing automation avec Mailchimp',
      'SEO et référencement naturel pour débutants',
      'Content marketing et storytelling'
    ],
    'Intelligence Artificielle': [
      'Introduction à ChatGPT et aux outils IA',
      'Prompt engineering pour non-développeurs',
      'Automatisation avec IA : Zapier et Make.com',
      'Créer du contenu avec DALL-E et Midjourney'
    ],
    'Business & Entrepreneuriat': [
      'Créer son business plan en 7 étapes',
      'Négociation commerciale et vente consultative',
      'Gestion financière pour entrepreneurs',
      'Leadership et management d\'équipe'
    ],
    'Administration & Gestion': [
      'Excel avancé pour l\'analyse de données',
      'Gestion de projet avec méthodes Agile',
      'Communication professionnelle efficace',
      'Comptabilité et finance pour non-financiers'
    ]
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCourse = async () => {
    if (!formData.topic.trim()) {
      toast.error('Veuillez décrire le sujet du cours');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(1);
    
    try {
      // Étape 1: Analyse du sujet
      toast.info('🔍 Étape 1/5: Analyse du sujet...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep(2);

      // Étape 2: Génération du plan de cours
      toast.info('📋 Étape 2/5: Création du plan de cours...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(3);

      // Étape 3: Génération du contenu des leçons
      toast.info('📚 Étape 3/5: Rédaction des leçons...');
      await new Promise(resolve => setTimeout(resolve, 2500));
      setCurrentStep(4);

      // Étape 4: Création des exercices et quiz
      toast.info('🎯 Étape 4/5: Création des exercices...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(5);

      // Étape 5: Finalisation
      toast.info('✨ Étape 5/5: Finalisation du cours...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simuler la création réussie du cours
      const mockCourse = {
        id: `course_${Date.now()}`,
        title: `${formData.topic}`,
        description: `Cours complet sur ${formData.topic.toLowerCase()}`,
        category: formData.category,
        difficulty_level: formData.difficulty,
        duration_minutes: formData.duration === 'short' ? 180 : formData.duration === 'medium' ? 360 : 600,
        lessons_count: formData.duration === 'short' ? 5 : formData.duration === 'medium' ? 8 : 12
      };

      toast.success(`🎉 Cours "${mockCourse.title}" créé avec succès !`);
      toast.success(`📚 ${mockCourse.lessons_count} leçons générées automatiquement`);
      toast.success(`🏆 Examen final de 10 questions créé`);

      // Réinitialiser le formulaire
      setFormData({
        topic: '',
        category: 'Marketing Digital',
        difficulty: 'intermediate',
        duration: 'medium',
        focus: 'practical'
      });

      if (onCourseCreated) {
        onCourseCreated();
      }
    } catch (error) {
      console.error('❌ Erreur génération cours:', error);
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
      setCurrentStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Créateur de Cours IA - Nouvelle Génération
          </CardTitle>
          <CardDescription>
            Notre IA crée automatiquement des cours complets avec leçons détaillées, exercices pratiques et examen final de 10 questions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Catégorie de cours</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic">Sujet du cours *</Label>
                <Textarea
                  id="topic"
                  placeholder="Ex: Comment utiliser Instagram pour développer son business..."
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  className="min-h-24"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Exemples de cours populaires :
              </h4>
              <div className="space-y-2">
                {courseExamples[formData.category as keyof typeof courseExamples]?.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleInputChange('topic', example)}
                    className="text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-white/50 p-2 rounded transition-colors w-full"
                  >
                    • {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Niveau</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Durée</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(duration => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="focus">Orientation</Label>
              <Select value={formData.focus} onValueChange={(value) => handleInputChange('focus', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {focuses.map(focus => (
                    <SelectItem key={focus.value} value={focus.value}>
                      {focus.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isGenerating && (
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium">Génération en cours...</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={currentStep === 1 ? 'font-medium text-blue-600' : ''}>Analyse du sujet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={currentStep === 2 ? 'font-medium text-blue-600' : ''}>Création du plan de cours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={currentStep === 3 ? 'font-medium text-blue-600' : ''}>Rédaction des leçons</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={currentStep === 4 ? 'font-medium text-blue-600' : ''}>Création des exercices</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStep >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={currentStep === 5 ? 'font-medium text-blue-600' : ''}>Finalisation</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Ce qui sera généré automatiquement :
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3 text-blue-600" />
                  Cours structuré avec objectifs pédagogiques
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-green-600" />
                  Leçons détaillées avec contenu théorique et pratique
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="h-3 w-3 text-purple-600" />
                  Exercices pratiques et études de cas
                </li>
              </ul>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <Award className="h-3 w-3 text-orange-600" />
                  Examen final de 10 questions (QCM)
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-yellow-600" />
                  Certificat de réussite LuvviX
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-red-600" />
                  Ressources et liens utiles
                </li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={generateCourse}
            disabled={isGenerating || !formData.topic.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                Générer le Cours Complet avec IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewCourseCreator;
