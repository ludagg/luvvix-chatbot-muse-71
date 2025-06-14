
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit3, Eye, BarChart3, Settings, Share2, Trash2, Users, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAINotifications } from '@/hooks/use-ai-notifications';
import { toast } from '@/hooks/use-toast';

interface MobileFormsProps {
  onBack: () => void;
}

interface Form {
  id: string;
  title: string;
  description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    submissions: number;
  };
}

const MobileForms = ({ onBack }: MobileFormsProps) => {
  const { user } = useAuth();
  const { generateSmartNotification } = useAINotifications();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-forms' | 'templates'>('my-forms');

  const [newForm, setNewForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forms')
        .select(`
          id,
          title,
          description,
          published,
          created_at,
          updated_at
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Ajouter le nombre de soumissions pour chaque formulaire
      const formsWithCounts = await Promise.all(
        (data || []).map(async (form) => {
          const { count } = await supabase
            .from('form_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id);

          return {
            ...form,
            _count: { submissions: count || 0 }
          };
        })
      );

      setForms(formsWithCounts);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les formulaires",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!newForm.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est obligatoire",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('forms')
        .insert({
          title: newForm.title,
          description: newForm.description,
          user_id: user?.id,
          published: false
        })
        .select()
        .single();

      if (error) throw error;

      // Générer une notification IA
      await generateSmartNotification(
        `Nouveau formulaire créé: "${newForm.title}"`,
        'forms'
      );

      await fetchForms();
      setShowCreateForm(false);
      setNewForm({ title: '', description: '' });

      toast({
        title: "Formulaire créé",
        description: "Votre formulaire a été créé avec succès",
      });
    } catch (error) {
      console.error('Error creating form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le formulaire",
        variant: "destructive"
      });
    }
  };

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le formulaire "${formTitle}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchForms();
      toast({
        title: "Formulaire supprimé",
        description: "Le formulaire a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le formulaire",
        variant: "destructive"
      });
    }
  };

  const handleTogglePublish = async (form: Form) => {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ published: !form.published })
        .eq('id', form.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchForms();
      toast({
        title: form.published ? "Formulaire dépublié" : "Formulaire publié",
        description: form.published 
          ? "Le formulaire n'est plus accessible au public"
          : "Le formulaire est maintenant accessible au public",
      });
    } catch (error) {
      console.error('Error toggling form publication:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du formulaire",
        variant: "destructive"
      });
    }
  };

  const copyFormLink = async (formId: string) => {
    const link = `${window.location.origin}/forms/${formId}/view`;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Lien copié",
        description: "Le lien du formulaire a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const templates = [
    {
      title: "Enquête de satisfaction",
      description: "Collectez les avis de vos clients",
      icon: "😊"
    },
    {
      title: "Formulaire de contact",
      description: "Permettez aux visiteurs de vous contacter",
      icon: "📧"
    },
    {
      title: "Inscription événement",
      description: "Gérez les inscriptions à vos événements",
      icon: "🎉"
    },
    {
      title: "Questionnaire RH",
      description: "Collectez des informations RH",
      icon: "👥"
    }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">LuvviX Forms</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('my-forms')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'my-forms'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Mes formulaires ({forms.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'templates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Modèles
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'my-forms' ? (
          <div className="p-4">
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun formulaire</h3>
                <p className="text-gray-600 mb-6">Créez votre premier formulaire pour commencer</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Créer un formulaire
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <div key={form.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{form.title}</h3>
                          {form.description && (
                            <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{form._count?.submissions || 0} réponses</span>
                            <span>
                              Modifié le {new Date(form.updated_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            form.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {form.published ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => window.open(`/forms/${form.id}/edit`, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Modifier</span>
                          </button>
                          
                          {form.published && (
                            <button
                              onClick={() => window.open(`/forms/${form.id}/view`, '_blank')}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Voir</span>
                            </button>
                          )}

                          {(form._count?.submissions || 0) > 0 && (
                            <button
                              onClick={() => window.open(`/forms/${form.id}/responses`, '_blank')}
                              className="flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-md text-sm hover:bg-purple-100"
                            >
                              <BarChart3 className="w-4 h-4" />
                              <span>Résultats</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {form.published && (
                            <button
                              onClick={() => copyFormLink(form.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleTogglePublish(form)}
                            className={`px-3 py-1 rounded-md text-sm ${
                              form.published
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {form.published ? 'Dépublier' : 'Publier'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteForm(form.id, form.title)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-4">
              {templates.map((template, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <button
                        onClick={() => {
                          setNewForm({
                            title: template.title,
                            description: template.description
                          });
                          setShowCreateForm(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Utiliser ce modèle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[70vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Nouveau formulaire</h2>
                <button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewForm({ title: '', description: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={newForm.title}
                    onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom de votre formulaire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newForm.description}
                    onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Description de votre formulaire"
                  />
                </div>

                <button
                  onClick={handleCreateForm}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Créer le formulaire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileForms;
