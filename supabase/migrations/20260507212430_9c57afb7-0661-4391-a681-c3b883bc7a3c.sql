-- Create allowed_numbers table
CREATE TABLE IF NOT EXISTS public.allowed_numbers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.allowed_numbers ENABLE ROW LEVEL SECURITY;

-- Create policy for public check (needed for the auth hook to verify numbers)
CREATE POLICY "Anyone can check if a number is allowed" 
ON public.allowed_numbers 
FOR SELECT 
USING (true);

-- Insert the numbers requested by the user
INSERT INTO public.allowed_numbers (phone, name) 
VALUES 
    ('4196848729', 'Novo Membro 1'),
    ('19998854466', 'Novo Membro 2'),
    ('19990080257', 'Novo Membro 3')
ON CONFLICT (phone) DO NOTHING;
