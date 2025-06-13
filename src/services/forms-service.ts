
import { supabase } from '@/integrations/supabase/client';

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

  async createForm(title: string, description?: string) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .insert([
          {
            title,
            description,
            published: false,
            form_structure: {
              fields: []
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
            form_structure: originalForm.form_structure
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
}

export default new FormsService();
