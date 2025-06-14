
-- Créer un bucket pour les médias du center
INSERT INTO storage.buckets (id, name, public) VALUES ('center-media', 'center-media', true);

-- Politique pour permettre à tous les utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'center-media' AND auth.role() = 'authenticated');

-- Politique pour permettre la lecture publique
CREATE POLICY "Public media access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'center-media');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete own media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'center-media' AND auth.uid()::text = (storage.foldername(name))[1]);
