-- Ensure the bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'prompt-assets';

-- Storage policies for prompt-assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to prompt-assets' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Access to prompt-assets" ON storage.objects FOR SELECT USING (bucket_id = 'prompt-assets');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admin Upload to prompt-assets' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Admin Upload to prompt-assets" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'prompt-assets' AND 
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admin Delete prompt-assets' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Admin Delete prompt-assets" ON storage.objects FOR DELETE USING (
            bucket_id = 'prompt-assets' AND 
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- Fix prompt_images policies (missing authenticated insert in some cases)
DROP POLICY IF EXISTS "Public view prompt_images" ON public.prompt_images;
CREATE POLICY "Public view prompt_images" ON public.prompt_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert prompt_images" ON public.prompt_images;
CREATE POLICY "Admin insert prompt_images" ON public.prompt_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin delete prompt_images" ON public.prompt_images;
CREATE POLICY "Admin delete prompt_images" ON public.prompt_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ensure admins can delete prompts
DROP POLICY IF EXISTS "Admin delete prompts" ON public.prompts;
CREATE POLICY "Admin delete prompts" ON public.prompts FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);