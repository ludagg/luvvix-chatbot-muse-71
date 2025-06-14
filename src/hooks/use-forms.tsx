
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FormQuestion {
  id: string;
  question_text: string;
  question_type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  required: boolean;
  options?: string[];
  position: number;
}

interface Form {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  questions: FormQuestion[];
  created_at: string;
  settings: {
    allowAnonymous?: boolean;
    maxSubmissions?: number;
    requireAuth?: boolean;
  };
}

interface FormSubmission {
  id: string;
  form_id: string;
  answers: Record<string, any>;
  submitted_at: string;
  responder_email?: string;
}

export const useForms = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchForms = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: formsData, error } = await supabase
        .from('forms')
        .select(`
          *,
          form_questions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedForms = formsData?.map(form => ({
        ...form,
        questions: form.form_questions?.sort((a: any, b: any) => a.position - b.position) || []
      })) || [];

      setForms(formattedForms);
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

  const createForm = async (formData: Omit<Form, 'id' | 'created_at' | 'questions'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('forms')
        .insert([{
          ...formData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchForms();
      toast({
        title: "Formulaire créé",
        description: "Le formulaire a été créé avec succès",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le formulaire",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateForm = async (formId: string, updates: Partial<Form>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('forms')
        .update(updates)
        .eq('id', formId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchForms();
      toast({
        title: "Formulaire modifié",
        description: "Le formulaire a été mis à jour",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le formulaire",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteForm = async (formId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchForms();
      toast({
        title: "Formulaire supprimé",
        description: "Le formulaire a été supprimé",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le formulaire",
        variant: "destructive"
      });
      return false;
    }
  };

  const addQuestion = async (formId: string, question: Omit<FormQuestion, 'id'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('form_questions')
        .insert([{
          ...question,
          form_id: formId
        }]);

      if (error) throw error;
      
      await fetchForms();
      return true;
    } catch (error) {
      console.error('Error adding question:', error);
      return false;
    }
  };

  const fetchSubmissions = async (formId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const submitForm = async (formId: string, answers: Record<string, any>, responderEmail?: string) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert([{
          form_id: formId,
          answers,
          responder_email: responderEmail,
          responder_id: user?.id
        }]);

      if (error) throw error;
      
      toast({
        title: "Formulaire soumis",
        description: "Votre réponse a été enregistrée",
      });
      
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le formulaire",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  return {
    forms,
    submissions,
    loading,
    createForm,
    updateForm,
    deleteForm,
    addQuestion,
    fetchSubmissions,
    submitForm,
    refetch: fetchForms,
  };
};
