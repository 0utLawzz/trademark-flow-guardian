
-- Enums
CREATE TYPE public.case_type AS ENUM ('trademark', 'ntn', 'copyright', 'company');

-- Utility: updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- CLIENTS
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code text NOT NULL UNIQUE,
  client_name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update clients" ON public.clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete clients" ON public.clients FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_clients_code ON public.clients (client_code);
CREATE INDEX idx_clients_name ON public.clients (client_name);

-- Client code generator (e.g., X726). Uses a sequence-backed random-ish letter+number.
CREATE SEQUENCE IF NOT EXISTS public.client_code_seq START 100;
CREATE OR REPLACE FUNCTION public.generate_client_code()
RETURNS text LANGUAGE plpgsql AS $$
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

-- CASES
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  case_type public.case_type NOT NULL,
  case_number text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all cases" ON public.cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_cases_client ON public.cases (client_id);
CREATE INDEX idx_cases_type ON public.cases (case_type);
CREATE INDEX idx_cases_number ON public.cases (case_number);

-- TRADEMARKS
CREATE TABLE public.trademarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.cases(id) ON DELETE CASCADE,
  application_name text,
  application_address text,
  application_class text,
  applicant_name text,
  trading_as text,
  applicant_address text,
  trademark_number text,
  folder_number text,
  google_drive_link text,
  assigning_type text,
  current_phase int NOT NULL DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 4),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trademarks TO authenticated;
GRANT ALL ON public.trademarks TO service_role;
ALTER TABLE public.trademarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all trademarks" ON public.trademarks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_trademarks_updated BEFORE UPDATE ON public.trademarks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_tm_number ON public.trademarks (trademark_number);
CREATE INDEX idx_tm_appname ON public.trademarks (application_name);
CREATE INDEX idx_tm_applicant ON public.trademarks (applicant_name);
CREATE INDEX idx_tm_trading_as ON public.trademarks (trading_as);

-- NTN DETAILS
CREATE TABLE public.ntn_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.cases(id) ON DELETE CASCADE,
  ntn_number text,
  registration_name text,
  business_type text,
  business_address text,
  filing_date date,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ntn_details TO authenticated;
GRANT ALL ON public.ntn_details TO service_role;
ALTER TABLE public.ntn_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all ntn" ON public.ntn_details FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_ntn_updated BEFORE UPDATE ON public.ntn_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- COPYRIGHT DETAILS
CREATE TABLE public.copyright_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.cases(id) ON DELETE CASCADE,
  work_title text,
  work_type text,
  author_name text,
  publication_date date,
  registration_number text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copyright_details TO authenticated;
GRANT ALL ON public.copyright_details TO service_role;
ALTER TABLE public.copyright_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all copyright" ON public.copyright_details FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_copyright_updated BEFORE UPDATE ON public.copyright_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- COMPANY DETAILS
CREATE TABLE public.company_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.cases(id) ON DELETE CASCADE,
  company_name text,
  incorporation_number text,
  incorporation_date date,
  directors text,
  registered_address text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_details TO authenticated;
GRANT ALL ON public.company_details TO service_role;
ALTER TABLE public.company_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all company" ON public.company_details FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_company_updated BEFORE UPDATE ON public.company_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CASE PHASES
CREATE TABLE public.case_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  phase_number int NOT NULL CHECK (phase_number BETWEEN 1 AND 4),
  phase_status text NOT NULL DEFAULT 'Filed',
  payment_clear boolean NOT NULL DEFAULT false,
  remarks text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, phase_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_phases TO authenticated;
GRANT ALL ON public.case_phases TO service_role;
ALTER TABLE public.case_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all case_phases" ON public.case_phases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_phases_updated BEFORE UPDATE ON public.case_phases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_phases_case ON public.case_phases (case_id);

-- AGENTS
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all agents" ON public.agents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_agents_updated BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ASSIGNMENTS
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
  assigned_date timestamptz NOT NULL DEFAULT now(),
  completion_date timestamptz,
  status text NOT NULL DEFAULT 'Assigned',
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all assignments" ON public.assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_assignments_case ON public.assignments (case_id);
CREATE INDEX idx_assignments_agent ON public.assignments (agent_id);

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  phase_number int NOT NULL CHECK (phase_number BETWEEN 1 AND 4),
  payment_required boolean NOT NULL DEFAULT true,
  payment_clear boolean NOT NULL DEFAULT false,
  amount numeric(12,2),
  payment_date timestamptz,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_payments_case ON public.payments (case_id);

-- DRIVE FOLDERS
CREATE TABLE public.drive_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  folder_number text,
  folder_name text NOT NULL,
  google_drive_folder_id text NOT NULL,
  google_drive_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drive_folders TO authenticated;
GRANT ALL ON public.drive_folders TO service_role;
ALTER TABLE public.drive_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all drive_folders" ON public.drive_folders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_drive_case ON public.drive_folders (case_id);
CREATE INDEX idx_drive_client ON public.drive_folders (client_id);

-- USER DRIVE CONNECTIONS (private per user)
CREATE TABLE public.user_drive_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  connection_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_drive_connections TO authenticated;
GRANT ALL ON public.user_drive_connections TO service_role;
ALTER TABLE public.user_drive_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own drive conn select" ON public.user_drive_connections FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own drive conn insert" ON public.user_drive_connections FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own drive conn update" ON public.user_drive_connections FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own drive conn delete" ON public.user_drive_connections FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER trg_user_drive_updated BEFORE UPDATE ON public.user_drive_connections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
