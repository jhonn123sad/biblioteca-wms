-- Add INSERT policy for profiles
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure the UPDATE policy is correct (it was already there but good to be sure)
-- The existing one was: auth.uid() = id
