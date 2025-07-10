-- Créer la table user_contacts pour gérer les contacts des utilisateurs
CREATE TABLE public.user_contacts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    contact_user_id uuid NOT NULL,
    contact_name text,
    added_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    is_blocked boolean NOT NULL DEFAULT false,
    UNIQUE(user_id, contact_user_id)
);

-- Activer RLS
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_contacts
CREATE POLICY "Users can view their own contacts" 
ON public.user_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own contacts" 
ON public.user_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
ON public.user_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.user_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_user_contacts_updated_at
    BEFORE UPDATE ON public.user_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts(user_id);
CREATE INDEX idx_user_contacts_contact_user_id ON public.user_contacts(contact_user_id);