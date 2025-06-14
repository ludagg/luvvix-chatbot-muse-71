
import React, { useState } from 'react';
import { ArrowLeft, Plus, FileText, Users, BarChart3, Settings, Edit3, Trash2, Eye, Send, Wand2 } from 'lucide-react';
import { useForms } from '@/hooks/use-forms';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MobileFormsProps {
  onBack: () => void;
}

const MobileForms = ({ onBack }: MobileFormsProps) => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'responses' | 'ai-create'>('list');
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { forms, submissions, loading, createForm, updateForm, deleteForm, fetchSubmissions } = useForms();
  const { user } = useAuth();

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez saisir un titre pour le formulaire",
        variant: "destructive"
      });
      return;
    }

    const success = await createForm({
      title: newFormTitle,
      description: newFormDescription,
      published: false,
      settings: {
        allowAnonymous: true,
        requireAuth: false
      }
    });

    if (success) {
      setNewFormTitle('');
      setNewFormDescription('');
      setView('list');
    }
  };

  const handleGenerateFormWithAI = async () => {
    if (!aiDescription.trim()) {
      toast({
        title: "Description requise",
        description: "Veuillez décrire votre formulaire",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer un formulaire",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-create-form', {
        body: {
          description: aiDescription.trim(),
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Formulaire créé avec l'IA !",
          description: "Votre formulaire a été généré automatiquement",
        });
        setAiDescription('');
        setView('list');
        // Refresh forms list
        window.location.reload();
      } else {
        throw new Error(data.error || "Erreur lors de la génération");
      }
    } catch (error) {
      console.error("Erreur génération IA:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le formulaire avec l'IA",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) {
      await deleteForm(formId);
    }
  };

  const handleViewResponses = async (form: any) => {
    setSelectedForm(form);
    await fetchSubmissions(form.id);
    setView('responses');
  };

  const renderFormsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Mes Formulaires</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('ai-create')}
            className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
          >
            <Wand2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('create')}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun formulaire</h3>
          <p className="text-gray-600 mb-4">Créez votre premier formulaire pour commencer</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setView('ai-create')}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>Créer avec l'IA</span>
            </button>
            <button
              onClick={() => setView('create')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Créer manuellement
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(form => (
            <div key={form.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{form.title}</h3>
                  {form.description && (
                    <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  form.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {form.published ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{form.questions?.length || 0} questions</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>0 réponses</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewResponses(form)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedForm(form);
                      setView('edit');
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAICreate = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setView('list')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <Wand2 className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Créer avec l'IA</h2>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Décrivez votre formulaire
          </label>
          <textarea
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            placeholder="Ex: Un formulaire de contact pour mon site web avec nom, email, sujet et message. Je veux aussi une case à cocher pour s'abonner à la newsletter..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">🎯 Comment bien décrire votre formulaire ?</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Précisez l'objectif (contact, inscription, enquête...)</li>
            <li>• Listez les informations à collecter</li>
            <li>• Mentionnez les types de champs souhaités</li>
            <li>• Indiquez si certains champs sont obligatoires</li>
          </ul>
        </div>

        <button
          onClick={handleGenerateFormWithAI}
          disabled={!aiDescription.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Générer le formulaire avec l'IA</span>
            </>
          )}
        </button>

        <div className="text-center">
          <button
            onClick={() => setView('create')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Ou créer manuellement
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setView('list')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Nouveau Formulaire</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du formulaire *
          </label>
          <input
            type="text"
            value={newFormTitle}
            onChange={(e) => setNewFormTitle(e.target.value)}
            placeholder="Ex: Enquête de satisfaction"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={newFormDescription}
            onChange={(e) => setNewFormDescription(e.target.value)}
            placeholder="Décrivez brièvement l'objectif de ce formulaire..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Fonctionnalités incluses</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Questions de différents types (texte, choix multiple, etc.)</li>
            <li>• Réponses anonymes possibles</li>
            <li>• Statistiques et analyses des réponses</li>
            <li>• Partage via lien direct</li>
          </ul>
        </div>

        <button
          onClick={handleCreateForm}
          disabled={!newFormTitle.trim()}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Créer le formulaire
        </button>

        <div className="text-center">
          <button
            onClick={() => setView('ai-create')}
            className="text-sm text-purple-600 hover:text-purple-900 underline flex items-center justify-center space-x-1"
          >
            <Wand2 className="w-4 h-4" />
            <span>Ou créer avec l'IA</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderResponses = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setView('list')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{selectedForm?.title}</h2>
          <p className="text-sm text-gray-600">Réponses reçues</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réponse</h3>
          <p className="text-gray-600">Les réponses apparaîtront ici une fois que les utilisateurs auront soumis le formulaire</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(submission => (
            <div key={submission.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">
                  Réponse #{submission.id.slice(-6)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-2">
                {Object.entries(submission.answers).map(([question, answer]) => (
                  <div key={question} className="text-sm">
                    <span className="font-medium text-gray-700">{question}:</span>
                    <span className="ml-2 text-gray-600">{String(answer)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">LuvviX Forms</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'list' && renderFormsList()}
        {view === 'ai-create' && renderAICreate()}
        {view === 'create' && renderCreateForm()}
        {view === 'responses' && renderResponses()}
      </div>
    </div>
  );
};

export default MobileForms;
