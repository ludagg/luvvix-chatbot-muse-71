
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
  settings: any;
}

export interface FormQuestion {
  id: string;
  form_id: string;
  question_text: string;
  question_type: "text" | "multipleChoice" | "checkboxes" | "dropdown" | "grid";
  description: string | null;
  required: boolean;
  options: any;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  responder_id?: string;
  responder_email?: string;
  submitted_at: string;
  answers: Record<string, any>;
}

class FormsService {
  async getForms() {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Form[];
    } catch (error: any) {
      console.error("Erreur lors de la récupération des formulaires:", error.message);
      toast.error("Impossible de charger vos formulaires");
      return [];
    }
  }

  async getFormById(id: string) {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Form;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du formulaire ${id}:`, error.message);
      toast.error("Impossible de charger ce formulaire");
      return null;
    }
  }

  async getFormQuestions(formId: string) {
    try {
      const { data, error } = await supabase
        .from("form_questions")
        .select("*")
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as FormQuestion[];
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des questions du formulaire ${formId}:`, error.message);
      toast.error("Impossible de charger les questions de ce formulaire");
      return [];
    }
  }

  async createForm(title: string, description?: string) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getSession();
      if (userError || !userData.session) {
        toast.error("Vous devez être connecté pour créer un formulaire");
        throw new Error("Utilisateur non connecté");
      }

      const userId = userData.session.user.id;
      const formId = uuidv4();

      const { data, error } = await supabase
        .from("forms")
        .insert({
          id: formId,
          user_id: userId,
          title,
          description: description || null
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Formulaire créé avec succès");
      return data as Form;
    } catch (error: any) {
      console.error("Erreur lors de la création du formulaire:", error.message);
      toast.error("Impossible de créer le formulaire");
      return null;
    }
  }

  async updateForm(formId: string, updates: Partial<Form>) {
    try {
      const { data, error } = await supabase
        .from("forms")
        .update(updates)
        .eq("id", formId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Formulaire mis à jour avec succès");
      return data as Form;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du formulaire ${formId}:`, error.message);
      toast.error("Impossible de mettre à jour le formulaire");
      return null;
    }
  }

  async saveQuestion(question: Partial<FormQuestion>) {
    try {
      if (question.id) {
        // Update existing question
        const { data, error } = await supabase
          .from("form_questions")
          .update(question)
          .eq("id", question.id)
          .select()
          .single();

        if (error) throw error;
        return data as FormQuestion;
      } else {
        // Create new question
        const newQuestion = {
          ...question,
          id: uuidv4()
        };

        const { data, error } = await supabase
          .from("form_questions")
          .insert(newQuestion)
          .select()
          .single();

        if (error) throw error;
        return data as FormQuestion;
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de la question:", error.message);
      toast.error("Impossible de sauvegarder cette question");
      return null;
    }
  }

  async deleteQuestion(questionId: string) {
    try {
      const { error } = await supabase
        .from("form_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;
      
      toast.success("Question supprimée avec succès");
      return true;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de la question ${questionId}:`, error.message);
      toast.error("Impossible de supprimer cette question");
      return false;
    }
  }

  async publishForm(formId: string, publish: boolean = true) {
    return this.updateForm(formId, { published: publish });
  }

  async submitFormResponse(formId: string, answers: Record<string, any>, email?: string) {
    try {
      const { data: userData } = await supabase.auth.getSession();
      const userId = userData.session?.user.id;
      
      const submission = {
        form_id: formId,
        responder_id: userId || null,
        responder_email: email || null,
        answers
      };

      const { data, error } = await supabase
        .from("form_submissions")
        .insert(submission)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Réponse soumise avec succès");
      return data as FormSubmission;
    } catch (error: any) {
      console.error("Erreur lors de la soumission du formulaire:", error.message);
      toast.error("Impossible de soumettre votre réponse");
      return null;
    }
  }

  async getFormResponses(formId: string) {
    try {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as FormSubmission[];
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des réponses du formulaire ${formId}:`, error.message);
      toast.error("Impossible de charger les réponses");
      return [];
    }
  }

  async duplicateForm(formId: string) {
    try {
      // Get original form
      const originalForm = await this.getFormById(formId);
      if (!originalForm) throw new Error("Formulaire introuvable");

      // Get questions
      const questions = await this.getFormQuestions(formId);

      // Create new form
      const newForm = await this.createForm(`${originalForm.title} (copie)`, originalForm.description);
      if (!newForm) throw new Error("Impossible de créer la copie du formulaire");

      // Copy questions
      for (const question of questions) {
        await this.saveQuestion({
          ...question,
          id: undefined, // Generate new ID
          form_id: newForm.id,
        });
      }

      toast.success("Formulaire dupliqué avec succès");
      return newForm;
    } catch (error: any) {
      console.error(`Erreur lors de la duplication du formulaire ${formId}:`, error.message);
      toast.error("Impossible de dupliquer le formulaire");
      return null;
    }
  }

  async deleteForm(formId: string) {
    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formId);

      if (error) throw error;
      
      toast.success("Formulaire supprimé avec succès");
      return true;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du formulaire ${formId}:`, error.message);
      toast.error("Impossible de supprimer ce formulaire");
      return false;
    }
  }
}

export const formsService = new FormsService();
export default formsService;
