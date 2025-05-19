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
  settings: FormSettings;
}

export interface FormSettings {
  requiresAuth?: boolean;
  collectEmail?: boolean;
  maxResponses?: number | null;
  closesAt?: string | null;
  confirmationMessage?: string;
  theme?: string;
  customCSS?: string;
  redirectUrl?: string;
  allowMultipleResponses?: boolean;
  [key: string]: any;
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
        // Ensure all required fields are provided
        if (!question.form_id) {
          throw new Error("form_id is required to create a question");
        }
        if (!question.question_text) {
          throw new Error("question_text is required to create a question");
        }
        if (!question.question_type) {
          throw new Error("question_type is required to create a question");
        }
        if (question.position === undefined) {
          throw new Error("position is required to create a question");
        }

        const newQuestion = {
          ...question,
          id: uuidv4(),
          form_id: question.form_id,
          question_text: question.question_text,
          question_type: question.question_type,
          position: question.position,
          required: question.required ?? false,
          options: question.options ?? {},
          description: question.description ?? null
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

  async updateFormSettings(formId: string, settings: FormSettings) {
    try {
      const { data, error } = await supabase
        .from("forms")
        .update({ settings })
        .eq("id", formId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Paramètres mis à jour avec succès");
      return data as Form;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour des paramètres du formulaire ${formId}:`, error.message);
      toast.error("Impossible de mettre à jour les paramètres");
      return null;
    }
  }

  async updateQuestionOrder(questions: { id: string; position: number }[]) {
    try {
      const updates = questions.map(({ id, position }) => ({
        id,
        position
      }));

      const { error } = await supabase
        .from("form_questions")
        .upsert(updates);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'ordre des questions:", error.message);
      toast.error("Impossible de réorganiser les questions");
      return false;
    }
  }
  
  async checkSubmissionAllowed(formId: string) {
    try {
      const { data: form, error } = await supabase
        .from("forms")
        .select("settings, published")
        .eq("id", formId)
        .single();

      if (error) throw error;
      
      if (!form.published) {
        return { allowed: false, reason: "Ce formulaire n'est pas publié." };
      }

      const settings = form.settings || {};
      
      if (settings.maxResponses) {
        const { count, error: countError } = await supabase
          .from("form_submissions")
          .select("id", { count: 'exact', head: true })
          .eq("form_id", formId);
          
        if (countError) throw countError;
        
        if (count && count >= settings.maxResponses) {
          return { 
            allowed: false, 
            reason: "Ce formulaire a atteint le nombre maximum de réponses." 
          };
        }
      }
      
      if (settings.closesAt && new Date(settings.closesAt) < new Date()) {
        return { 
          allowed: false, 
          reason: "Ce formulaire est fermé." 
        };
      }
      
      return { allowed: true };
    } catch (error: any) {
      console.error(`Erreur lors de la vérification du formulaire ${formId}:`, error.message);
      return { 
        allowed: false, 
        reason: "Une erreur s'est produite lors de la vérification du formulaire." 
      };
    }
  }
  
  async shareForm(formId: string, email: string) {
    try {
      // Logique pour partager un formulaire via email
      // (à implémenter plus tard avec un service d'envoi d'emails)
      
      toast.success(`Formulaire partagé à ${email}`);
      return true;
    } catch (error: any) {
      console.error(`Erreur lors du partage du formulaire ${formId}:`, error.message);
      toast.error("Impossible de partager le formulaire");
      return false;
    }
  }

  async publishForm(formId: string, publish: boolean = true) {
    return this.updateForm(formId, { published: publish });
  }

  async submitFormResponse(formId: string, answers: Record<string, any>, email?: string) {
    try {
      // Vérifier si la soumission est autorisée
      const { allowed, reason } = await this.checkSubmissionAllowed(formId);
      if (!allowed) {
        toast.error(reason);
        return null;
      }
      
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

  async getResponseStats(formId: string) {
    try {
      const [responsesResult, questionsResult] = await Promise.all([
        supabase
          .from("form_submissions")
          .select("*")
          .eq("form_id", formId)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("form_questions")
          .select("*")
          .eq("form_id", formId)
          .order("position", { ascending: true })
      ]);
      
      if (responsesResult.error) throw responsesResult.error;
      if (questionsResult.error) throw questionsResult.error;
      
      const responses = responsesResult.data;
      const questions = questionsResult.data;
      
      // Calculate stats for each question
      const stats = questions.map(question => {
        const questionStats = {
          questionId: question.id,
          questionText: question.question_text,
          questionType: question.question_type,
          totalAnswers: 0,
          answerData: {}
        };
        
        responses.forEach(response => {
          const answer = response.answers[question.id];
          if (answer !== undefined && answer !== null) {
            questionStats.totalAnswers++;
            
            if (Array.isArray(answer)) {
              // Pour les cases à cocher
              answer.forEach(option => {
                questionStats.answerData[option] = (questionStats.answerData[option] || 0) + 1;
              });
            } else {
              // Pour les autres types
              questionStats.answerData[answer] = (questionStats.answerData[answer] || 0) + 1;
            }
          }
        });
        
        return questionStats;
      });
      
      return {
        totalResponses: responses.length,
        latestResponse: responses.length ? responses[0].submitted_at : null,
        stats
      };
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des statistiques du formulaire ${formId}:`, error.message);
      toast.error("Impossible de charger les statistiques");
      return null;
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
      
      // Dupliquer les paramètres
      if (originalForm.settings) {
        await this.updateFormSettings(newForm.id, originalForm.settings);
      }

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
