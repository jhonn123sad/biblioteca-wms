-- Fix function search path
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Fix storage bucket listing (more specific policy)
DROP POLICY "Prompt images are public" ON storage.objects;
CREATE POLICY "Prompt images are public" ON storage.objects FOR SELECT 
USING (bucket_id = 'prompt-assets' AND (storage.foldername(name))[1] IS NOT NULL);
