
import { supabase } from '@/integrations/supabase/client';

export interface Form {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  settings?: {
    requiresAuth?: boolean;
    collectEmail?: boolean;
    maxResponses?: number;
    closesAt?: string;
    confirmationMessage?: string;
    redirectUrl?: string;
  };
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface FormQuestion {
  id: string;
  form_id: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'multipleChoice' | 'checkboxes' | 'dropdown' | 'email' | 'number' | 'date' | 'phone' | 'url' | 'grid';
  description?: string;
  required: boolean;
  options?: {
    choices?: string[];
  };
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  responder_id?: string;
  responder_email?: string;
  answers: Record<string, any>;
  submitted_at: string;
}

class FormsService {
  async getForms() {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      return [];
    }
  }

  async getFormById(formId: string): Promise<Form | null> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching form:', error);
      return null;
    }
  }

  async getFormQuestions(formId: string): Promise<FormQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('form_questions')
        .select('*')
        .eq('form_id', formId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching form questions:', error);
      return [];
    }
  }

  async getFormResponses(formId: string): Promise<FormSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching form responses:', error);
      return [];
    }
  }

  async createForm(title: string, description?: string) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .insert([
          {
            title,
            description,
            published: false,
            settings: {
              requiresAuth: false,
              collectEmail: true
            }
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating form:', error);
      return null;
    }
  }

  async updateForm(formId: string, updates: Partial<Form>) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .update(updates)
        .eq('id', formId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  async deleteForm(formId: string) {
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      return false;
    }
  }

  async duplicateForm(formId: string) {
    try {
      const { data: originalForm, error: fetchError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();
      
      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('forms')
        .insert([
          {
            title: `${originalForm.title} (Copie)`,
            description: originalForm.description,
            published: false,
            settings: originalForm.settings
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error duplicating form:', error);
      return null;
    }
  }

  async saveQuestion(question: Partial<FormQuestion>): Promise<FormQuestion> {
    try {
      if (question.id) {
        // Update existing question
        const { data, error } = await supabase
          .from('form_questions')
          .update(question)
          .eq('id', question.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new question
        const { data, error } = await supabase
          .from('form_questions')
          .insert([question])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  async deleteQuestion(questionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('form_questions')
        .delete()
        .eq('id', questionId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  async updateQuestionOrder(questions: Partial<FormQuestion>[]): Promise<void> {
    try {
      const updates = questions.map(q => ({
        id: q.id,
        position: q.position
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('form_questions')
          .update({ position: update.position })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating question order:', error);
      throw error;
    }
  }

  async submitFormResponse(formId: string, answers: Record<string, any>, responderEmail?: string): Promise<FormSubmission> {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert([
          {
            form_id: formId,
            answers,
            responder_email: responderEmail
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting form response:', error);
      throw error;
    }
  }

  async checkSubmissionAllowed(formId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const form = await this.getFormById(formId);
      
      if (!form) {
        return { allowed: false, reason: 'Formulaire introuvable' };
      }

      if (!form.published) {
        return { allowed: false, reason: 'Formulaire non publié' };
      }

      // Check if form has expired
      if (form.settings?.closesAt) {
        const closesAt = new Date(form.settings.closesAt);
        if (new Date() > closesAt) {
          return { allowed: false, reason: 'Formulaire expiré' };
        }
      }

      // Check response limit
      if (form.settings?.maxResponses) {
        const responses = await this.getFormResponses(formId);
        if (responses.length >= form.settings.maxResponses) {
          return { allowed: false, reason: 'Limite de réponses atteinte' };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking submission allowed:', error);
      return { allowed: false, reason: 'Erreur lors de la vérification' };
    }
  }
}

export default new FormsService();
