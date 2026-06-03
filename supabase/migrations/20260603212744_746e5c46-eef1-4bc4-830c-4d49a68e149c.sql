
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.generate_client_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  letters text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  n int;
  candidate text;
BEGIN
  LOOP
    n := nextval('public.client_code_seq');
    candidate := substr(letters, 1 + ((n / 1000) % length(letters)), 1) || lpad((n % 1000)::text, 3, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.clients WHERE client_code = candidate);
  END LOOP;
  RETURN candidate;
END $$;

-- Replace permissive ALL policies with SELECT + authenticated-only write policies
DO $$
DECLARE
  t text;
  pol record;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'agents','assignments','case_phases','cases','company_details',
    'copyright_details','drive_folders','ntn_details','payments','trademarks'
  ]) LOOP
    -- drop existing policies on the table
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format('CREATE POLICY "auth select %1$s" ON public.%1$I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)', t);
    EXECUTE format('CREATE POLICY "auth insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)', t);
    EXECUTE format('CREATE POLICY "auth update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)', t);
    EXECUTE format('CREATE POLICY "auth delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)', t);
  END LOOP;
END $$;

-- Same treatment for clients (already split but with `true`)
DROP POLICY IF EXISTS "auth read clients" ON public.clients;
DROP POLICY IF EXISTS "auth write clients" ON public.clients;
DROP POLICY IF EXISTS "auth update clients" ON public.clients;
DROP POLICY IF EXISTS "auth delete clients" ON public.clients;

CREATE POLICY "auth select clients" ON public.clients FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth update clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth delete clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
