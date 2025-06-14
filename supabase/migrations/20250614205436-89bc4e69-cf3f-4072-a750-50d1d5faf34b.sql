
-- Créer les tables pour le cerveau IA centralisé
CREATE TABLE public.user_brain_knowledge (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
    behavioral_patterns jsonb NOT NULL DEFAULT '{}'::jsonb,
    interaction_history jsonb NOT NULL DEFAULT '[]'::jsonb,
    learning_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
    ecosystem_usage jsonb NOT NULL DEFAULT '{}'::jsonb,
    predictions jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Table pour les interactions enrichies du cerveau
CREATE TABLE public.brain_interactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type text NOT NULL,
    source_app text NOT NULL,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    brain_analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
    confidence_score real DEFAULT 0.8,
    patterns_detected jsonb DEFAULT '[]'::jsonb,
    actions_triggered jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_user_brain_knowledge_user_id ON public.user_brain_knowledge(user_id);
CREATE INDEX idx_brain_interactions_user_id ON public.brain_interactions(user_id);
CREATE INDEX idx_brain_interactions_type ON public.brain_interactions(interaction_type);
CREATE INDEX idx_brain_interactions_app ON public.brain_interactions(source_app);
CREATE INDEX idx_brain_interactions_created_at ON public.brain_interactions(created_at);

-- RLS Policies
ALTER TABLE public.user_brain_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own brain knowledge"
ON public.user_brain_knowledge FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own brain interactions"
ON public.brain_interactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert brain interactions"
ON public.brain_interactions FOR INSERT
WITH CHECK (true);
