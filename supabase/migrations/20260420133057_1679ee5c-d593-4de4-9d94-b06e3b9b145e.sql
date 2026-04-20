-- Defense in depth: explicit deny policy for reading leads from client.
-- Only the service role (server-side) can read lead contact data.
CREATE POLICY "No client-side read access to leads"
ON public.leads
FOR SELECT
TO anon, authenticated
USING (false);