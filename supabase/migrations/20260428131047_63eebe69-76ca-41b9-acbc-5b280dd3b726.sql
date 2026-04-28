-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create tables
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.prompt_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up storage
INSERT INTO storage.buckets (id, name, public) VALUES ('prompt-assets', 'prompt-assets', true);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Prompts policies
CREATE POLICY "Prompts are viewable by everyone" ON public.prompts FOR SELECT USING (true);
CREATE POLICY "Admins can manage prompts" ON public.prompts
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Prompt Images policies
CREATE POLICY "Images are viewable by everyone" ON public.prompt_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage images" ON public.prompt_images
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage policies
CREATE POLICY "Prompt images are public" ON storage.objects FOR SELECT USING (bucket_id = 'prompt-assets');
CREATE POLICY "Admins can upload images" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'prompt-assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update images" ON storage.objects FOR UPDATE 
    USING (bucket_id = 'prompt-assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE 
    USING (bucket_id = 'prompt-assets' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
