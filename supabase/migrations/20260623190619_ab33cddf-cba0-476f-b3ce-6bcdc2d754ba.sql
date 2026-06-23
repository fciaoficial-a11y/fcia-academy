
-- =========================================================================
-- AI Study Flow — Foundation (Phase 1+2)
-- =========================================================================

-- 1) Roles infrastructure (required by RLS policies below)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2) Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- 3) ai_course_drafts
CREATE TABLE public.ai_course_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid,
  pdf_path text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded',
  raw_extracted_text text,
  ai_payload jsonb,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_course_drafts TO authenticated;
GRANT ALL ON public.ai_course_drafts TO service_role;
ALTER TABLE public.ai_course_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manages drafts" ON public.ai_course_drafts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_ai_course_drafts_updated_at
  BEFORE UPDATE ON public.ai_course_drafts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) course_exams
-- NOTE: public.courses does not yet exist; course_id is a plain uuid for now.
CREATE TABLE public.course_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  passing_score integer NOT NULL DEFAULT 70,
  question_count integer NOT NULL DEFAULT 10,
  shuffle_seed_strategy text NOT NULL DEFAULT 'random',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_exams TO authenticated;
GRANT ALL ON public.course_exams TO service_role;
ALTER TABLE public.course_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manages exams" ON public.course_exams
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "students read published exams" ON public.course_exams
  FOR SELECT TO authenticated USING (published = true);
CREATE TRIGGER trg_course_exams_updated_at
  BEFORE UPDATE ON public.course_exams
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5) exam_attempts
CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  score numeric(5,2),
  passed boolean NOT NULL DEFAULT false,
  answers jsonb,
  question_ids uuid[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exam_attempts_user_course ON public.exam_attempts(user_id, course_id);
GRANT SELECT, INSERT, UPDATE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students read own attempts" ON public.exam_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "students insert own attempts" ON public.exam_attempts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- Score/passed updates are performed server-side using service_role; admins may also update.
CREATE POLICY "admin updates attempts" ON public.exam_attempts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_exam_attempts_updated_at
  BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6) issued_certificates
CREATE TABLE public.issued_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL,
  attempt_id uuid NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  qr_payload text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  hours_load numeric(6,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX idx_issued_certificates_user ON public.issued_certificates(user_id);
GRANT SELECT ON public.issued_certificates TO authenticated;
-- Public validation endpoint (/certificado/{code}) uses service_role server-side.
GRANT ALL ON public.issued_certificates TO service_role;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students read own certificates" ON public.issued_certificates
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_issued_certificates_updated_at
  BEFORE UPDATE ON public.issued_certificates
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
