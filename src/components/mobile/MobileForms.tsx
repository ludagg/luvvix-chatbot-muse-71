
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Edit, Share, Trash2, Users, BarChart3, Settings, Bot, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import formsService from '@/services/forms-service';

const MobileForms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadForms();
    loadAISuggestions();
  }, []);

  const loadForms = async () => {
    try {
      const data = await formsService.getForms();
      setForms(data || []);
    } catch (error) {
      console.error('Erreur chargement formulaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAISuggestions = async () => {
    try {
      // Suggestions IA pour les formulaires
      const suggestions = [
        {
          type: 'optimization',
          title: 'Optimisation des questions',
          description: 'L\'IA peut améliorer la clarté de vos questions pour augmenter le taux de réponse',
          action: 'Optimiser'
        },
        {
          type: 'template',
          title: 'Nouveau modèle suggéré',
          description: 'Formulaire de satisfaction client basé sur les dernières tendances',
          action: 'Créer'
        }
      ];
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Erreur suggestions IA:', error);
    }
  };

  const handleCreateForm = async (title: string, description: string) => {
    try {
      const newForm = await formsService.createForm(title, description);
      if (newForm) {
        setForms(prev => [newForm, ...prev]);
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Erreur création formulaire:', error);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    try {
      const success = await formsService.deleteForm(formId);
      if (success) {
        setForms(prev => prev.filter(form => form.id !== formId));
      }
    } catch (error) {
      console.error('Erreur suppression formulaire:', error);
    }
  };

  const handleDuplicateForm = async (formId: string) => {
    try {
      const duplicatedForm = await formsService.duplicateForm(formId);
      if (duplicatedForm) {
        setForms(prev => [duplicatedForm, ...prev]);
      }
    } catch (error) {
      console.error('Erreur duplication formulaire:', error);
    }
  };

  const filteredForms = forms.filter(form => {
    if (activeTab === 'published') return form.published;
    if (activeTab === 'draft') return !form.published;
    return true;
  });

  const getFormIcon = (form: any) => {
    if (form.published) return <Eye className="w-4 h-4 text-green-600" />;
    return <Edit className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="flex-1 bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">LuvviX Forms</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'published', label: 'Publiés' },
            { key: 'draft', label: 'Brouillons' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions IA */}
      {aiSuggestions.length > 0 && (
        <div className="p-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Assistant Forms IA</span>
            </div>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <h4 className="font-medium mb-1">{suggestion.title}</h4>
                <p className="text-sm text-green-100 mb-2">{suggestion.description}</p>
                <button className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
                  {suggestion.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des formulaires */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredForms.length > 0 ? (
          <div className="space-y-3">
            {filteredForms.map((form) => (
              <div key={form.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{form.title}</h3>
                        {getFormIcon(form)}
                      </div>
                      {form.description && (
                        <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Créé le {new Date(form.created_at).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span>{form.published ? 'Publié' : 'Brouillon'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDuplicateForm(form.id)}
                    className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    Dupliquer
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                    <Share className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'published' ? 'Aucun formulaire publié' :
               activeTab === 'draft' ? 'Aucun brouillon' : 'Aucun formulaire'}
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier formulaire
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-blue-600 transition-colors"
            >
              Créer un formulaire
            </button>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouveau formulaire</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <CreateFormModal
                onSubmit={handleCreateForm}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour le modal de création
const CreateFormModal = ({ onSubmit, onCancel }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive",
      });
      return;
    }
    onSubmit(title, description);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Titre du formulaire"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Description (optionnelle)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 resize-none"
      />
      
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 text-gray-600 font-medium rounded-2xl hover:bg-gray-100 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-2xl hover:bg-blue-600 transition-colors"
        >
          Créer
        </button>
      </div>
    </div>
  );
};

export default MobileForms;
