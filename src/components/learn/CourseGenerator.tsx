
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Sparkles } from "lucide-react";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { toast } from "sonner";

interface CourseGeneratorProps {
  onCourseGenerated: () => void;
}

const CourseGenerator = ({ onCourseGenerated }: CourseGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = [
    "Informatique fondamentale",
    "Programmation Web",
    "Intelligence Artificielle",
    "Base de données",
    "Cybersécurité",
    "Réseaux",
    "Développement Mobile",
    "DevOps",
    "Data Science",
    "Cloud Computing"
  ];

  const generateCourse = async () => {
    if (!topic.trim() || !category || !difficulty) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await luvvixLearnService.generateCourse(topic, category, difficulty);
      
      if (result.success) {
        toast.success(`🎉 Cours "${result.course.title}" généré avec succès par LuvviX AI !`);
        setTopic("");
        setCategory("");
        setDifficulty("");
        onCourseGenerated();
      } else {
        throw new Error(result.error || 'Erreur génération');
      }
    } catch (error) {
      console.error('Erreur génération cours:', error);
      toast.error("Erreur lors de la génération du cours");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Générateur de cours IA</h3>
          <p className="text-sm text-gray-600">Laisse LuvviX AI créer un cours personnalisé pour toi</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="topic">Sujet du cours</Label>
          <Input
            id="topic"
            placeholder="Ex: Les bases de Python, React avancé, Introduction à l'IA..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Niveau de difficulté</Label>
            <Select value={difficulty} onValueChange={setDifficulty} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Débutant</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="advanced">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">✨ Magie de l'IA LuvviX</p>
              <p className="text-blue-700">
                Notre IA va automatiquement créer un cours complet avec leçons structurées, 
                exercices pratiques, quiz d'évaluation et objectifs pédagogiques adaptés à ton niveau.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={generateCourse}
          disabled={isGenerating || !topic.trim() || !category || !difficulty}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              LuvviX AI génère votre cours...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Générer le cours avec l'IA
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default CourseGenerator;
