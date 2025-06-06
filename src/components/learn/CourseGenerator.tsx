import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, BookOpen, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import luvvixLearnService from '@/services/luvvix-learn-service';

interface CourseGeneratorProps {
  onCourseGenerated?: () => void;
}

const CourseGenerator: React.FC<CourseGeneratorProps> = ({ onCourseGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    category: 'Développement Web',
    difficulty: 'intermediate',
    duration: 'medium',
    focus: 'practical'
  });

  const categories = [
    'Développement Web',
    'Intelligence Artificielle',
    'Cybersécurité',
    'Data Science',
    'DevOps',
    'Mobile',
    'Cloud Computing',
    'Base de données'
  ];

  const difficulties = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' }
  ];

  const durations = [
    { value: 'short', label: 'Court (4-6 leçons)' },
    { value: 'medium', label: 'Moyen (8-10 leçons)' },
    { value: 'long', label: 'Long (12-15 leçons)' }
  ];

  const focuses = [
    { value: 'theoretical', label: 'Théorique' },
    { value: 'practical', label: 'Pratique' },
    { value: 'mixed', label: 'Mixte' }
  ];

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
    try {
      console.log('🎯 Génération de cours par étapes avec Gemini:', formData);
      
      // Afficher les étapes de progression
      toast.info('🔄 Étape 1/5: Analyse du sujet...');
      
      const result = await luvvixLearnService.generateCourse(
        formData.topic,
        formData.category,
        formData.difficulty
      );

      if (result && result.course) {
        toast.success(`🎉 Cours "${result.course.title}" créé avec succès !`);
        
        if (result.lessons && result.lessons.length > 0) {
          toast.success(`📚 ${result.lessons.length} leçons générées automatiquement`);
        }

        // Réinitialiser le formulaire
        setFormData({
          topic: '',
          category: 'Développement Web',
          difficulty: 'intermediate',
          duration: 'medium',
          focus: 'practical'
        });

        if (onCourseGenerated) {
          onCourseGenerated();
        }
      } else {
        throw new Error('Aucun cours généré');
      }
    } catch (error) {
      console.error('❌ Erreur génération cours:', error);
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
    }
  };

  const createBasicLessons = async (courseId: string) => {
    try {
      const lessonCount = formData.duration === 'short' ? 6 : formData.duration === 'medium' ? 8 : 12;
      
      const basicLessons = Array.from({ length: lessonCount }, (_, index) => ({
        title: `Leçon ${index + 1}: ${getGenericLessonTitle(index, formData.topic)}`,
        content: `Contenu de la leçon ${index + 1} sur ${formData.topic}.\n\nCette leçon couvre les aspects essentiels et pratiques du sujet.`,
        duration: 30,
        type: index % 3 === 2 ? 'quiz' : 'theory'
      }));

      await luvvixLearnService.createLessonsForCourse(courseId, basicLessons);
      console.log('✅ Leçons de base créées');
    } catch (error) {
      console.error('❌ Erreur création leçons de base:', error);
    }
  };

  const getGenericLessonTitle = (index: number, topic: string) => {
    const titles = [
      `Introduction à ${topic}`,
      `Concepts fondamentaux`,
      `Premiers pas pratiques`,
      `Techniques avancées`,
      `Mise en pratique`,
      `Outils et ressources`,
      `Bonnes pratiques`,
      `Projet final`,
      `Optimisation`,
      `Déploiement`,
      `Maintenance`,
      `Conclusion et ressources`
    ];
    return titles[index] || `Approfondissement`;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Générateur de Cours IA
        </CardTitle>
        <CardDescription>
          Notre IA crée automatiquement un cours complet avec leçons, exercices et quiz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">Sujet du cours *</Label>
            <Textarea
              id="topic"
              placeholder="Ex: Apprendre React avec TypeScript pour créer des applications web modernes..."
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Niveau</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Ce qui sera généré automatiquement :
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              Cours structuré avec objectifs pédagogiques
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Leçons détaillées avec contenu théorique et pratique
            </li>
            <li className="flex items-center gap-2">
              <Brain className="h-3 w-3" />
              Quiz et exercices d'évaluation
            </li>
            <li className="flex items-center gap-2">
              <Target className="h-3 w-3" />
              Projets pratiques et certification
            </li>
          </ul>
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
              Générer le Cours Complet
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseGenerator;
