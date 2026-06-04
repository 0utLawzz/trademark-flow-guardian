
-- Drop old tables
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.case_phases CASCADE;
DROP TABLE IF EXISTS public.drive_folders CASCADE;
DROP TABLE IF EXISTS public.trademarks CASCADE;
DROP TABLE IF EXISTS public.ntn_details CASCADE;
DROP TABLE IF EXISTS public.copyright_details CASCADE;
DROP TABLE IF EXISTS public.company_details CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP FUNCTION IF EXISTS public.generate_client_code() CASCADE;
DROP SEQUENCE IF EXISTS public.client_code_seq CASCADE;

-- ============= clients =============
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_prefix text NOT NULL DEFAULT 'X',
  client_code integer NOT NULL,
  client_name text NOT NULL,
  trading_as text,
  address text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_prefix, client_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read clients" ON public.clients FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER clients_set_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= attorneys =============
CREATE TABLE public.attorneys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attorneys TO authenticated;
GRANT ALL ON public.attorneys TO service_role;
ALTER TABLE public.attorneys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read attorneys" ON public.attorneys FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert attorneys" ON public.attorneys FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update attorneys" ON public.attorneys FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete attorneys" ON public.attorneys FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============= applications =============
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_number text NOT NULL UNIQUE,
  trademark_number text,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  service_type text NOT NULL DEFAULT 'Trademark',
  application_name text,
  mark_description text,
  applicant_type text,
  applicant_name text,
  trading_as text,
  applicant_address text,
  class text[] DEFAULT '{}',
  logo_url text,
  attorney_id uuid REFERENCES public.attorneys(id) ON DELETE SET NULL,
  city text,
  current_stage integer NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 4),
  sub_status text,
  is_complete boolean NOT NULL DEFAULT false,
  last_operation_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX applications_folder_number_idx ON public.applications (folder_number);
CREATE INDEX applications_trademark_number_idx ON public.applications (trademark_number);
CREATE INDEX applications_client_id_idx ON public.applications (client_id);
CREATE INDEX applications_current_stage_idx ON public.applications (current_stage);
CREATE INDEX applications_service_type_idx ON public.applications (service_type);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update applications" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete applications" ON public.applications FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER applications_set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Stage cannot go backwards
CREATE OR REPLACE FUNCTION public.applications_stage_forward_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.current_stage < OLD.current_stage THEN
    RAISE EXCEPTION 'current_stage cannot move backwards (% -> %)', OLD.current_stage, NEW.current_stage;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER applications_stage_forward_only_trg
  BEFORE UPDATE OF current_stage ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.applications_stage_forward_only();

-- ============= stage_updates =============
CREATE TABLE public.stage_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage integer NOT NULL CHECK (stage BETWEEN 1 AND 4),
  status text NOT NULL,
  update_date timestamptz NOT NULL DEFAULT now(),
  file_url text,
  notes text,
  hearing_date timestamptz,
  journal_no text,
  tcs_tracking text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stage_updates_app_idx ON public.stage_updates (application_id, update_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stage_updates TO authenticated;
GRANT ALL ON public.stage_updates TO service_role;
ALTER TABLE public.stage_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read stage_updates" ON public.stage_updates FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert stage_updates" ON public.stage_updates FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update stage_updates" ON public.stage_updates FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete stage_updates" ON public.stage_updates FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Trigger to advance application stage/sub_status/last_operation_date
CREATE OR REPLACE FUNCTION public.stage_updates_apply_to_application()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.applications
     SET current_stage = GREATEST(current_stage, NEW.stage),
         sub_status = NEW.status,
         last_operation_date = NEW.update_date
   WHERE id = NEW.application_id;
  RETURN NEW;
END $$;
CREATE TRIGGER stage_updates_apply_to_application_trg
  AFTER INSERT ON public.stage_updates
  FOR EACH ROW EXECUTE FUNCTION public.stage_updates_apply_to_application();

-- ============= stage_payments =============
CREATE TABLE public.stage_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage integer NOT NULL CHECK (stage BETWEEN 1 AND 4),
  payment_status text NOT NULL DEFAULT 'Due',
  amount numeric(12,2),
  payment_date timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, stage)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stage_payments TO authenticated;
GRANT ALL ON public.stage_payments TO service_role;
ALTER TABLE public.stage_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read stage_payments" ON public.stage_payments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert stage_payments" ON public.stage_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update stage_payments" ON public.stage_payments FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete stage_payments" ON public.stage_payments FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER stage_payments_set_updated_at BEFORE UPDATE ON public.stage_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= assignments =============
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  city text,
  assigned_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'Pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assignments_app_idx ON public.assignments (application_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read assignments" ON public.assignments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update assignments" ON public.assignments FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete assignments" ON public.assignments FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER assignments_set_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= journal_entries =============
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_no text,
  journal_date date,
  trademark_number text,
  application_name text,
  class text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX journal_entries_tm_idx ON public.journal_entries (trademark_number);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read journal_entries" ON public.journal_entries FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert journal_entries" ON public.journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update journal_entries" ON public.journal_entries FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete journal_entries" ON public.journal_entries FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER journal_entries_set_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= ipo_entries =============
CREATE TABLE public.ipo_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date,
  trademark_number text,
  application_name text,
  class text,
  status text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ipo_entries_tm_idx ON public.ipo_entries (trademark_number);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ipo_entries TO authenticated;
GRANT ALL ON public.ipo_entries TO service_role;
ALTER TABLE public.ipo_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read ipo_entries" ON public.ipo_entries FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff insert ipo_entries" ON public.ipo_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update ipo_entries" ON public.ipo_entries FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff delete ipo_entries" ON public.ipo_entries FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER ipo_entries_set_updated_at BEFORE UPDATE ON public.ipo_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= folder number generator =============
CREATE OR REPLACE FUNCTION public.generate_folder_number(p_client_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_prefix text;
  v_code integer;
  v_next integer;
BEGIN
  SELECT client_prefix, client_code INTO v_prefix, v_code
    FROM public.clients WHERE id = p_client_id;
  IF v_prefix IS NULL THEN
    RAISE EXCEPTION 'Client % not found', p_client_id;
  END IF;

  SELECT COALESCE(MAX(NULLIF(regexp_replace(folder_number, '^.*-', ''), '')::integer), 0) + 1
    INTO v_next
    FROM public.applications
   WHERE client_id = p_client_id;

  RETURN v_prefix || '-' || v_code::text || '-' || lpad(v_next::text, 3, '0');
END $$;
