-- Tabela de leads capturados pelo formulário público
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  property_interest TEXT,
  buying_intention TEXT,
  timeframe TEXT,
  preferred_location TEXT,
  price_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer visitante (anon) envie um lead — necessário para formulário público
CREATE POLICY "Anyone can submit a lead"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(name) > 0 AND char_length(name) <= 100
  AND char_length(whatsapp) > 0 AND char_length(whatsapp) <= 30
  AND (property_interest IS NULL OR char_length(property_interest) <= 200)
  AND (buying_intention IS NULL OR char_length(buying_intention) <= 100)
  AND (timeframe IS NULL OR char_length(timeframe) <= 100)
  AND (preferred_location IS NULL OR char_length(preferred_location) <= 200)
  AND (price_range IS NULL OR char_length(price_range) <= 100)
);

-- NÃO criamos política de SELECT: leads ficam protegidos.
-- Você acessa os dados pelo painel de backend do Lovable Cloud.

-- Índice para ordenação por data
CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);