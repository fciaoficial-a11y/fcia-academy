
-- =====================================================
-- 1. Histórico de versões do payload IA
-- =====================================================
CREATE TABLE public.ai_draft_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.ai_course_drafts(id) ON DELETE CASCADE,
  version integer NOT NULL,
  ai_payload jsonb NOT NULL,
  change_kind text NOT NULL DEFAULT 'edit',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (draft_id, version)
);

GRANT SELECT, INSERT ON public.ai_draft_versions TO authenticated;
GRANT ALL ON public.ai_draft_versions TO service_role;

ALTER TABLE public.ai_draft_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read draft versions"
  ON public.ai_draft_versions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ai_draft_versions_draft ON public.ai_draft_versions(draft_id, version DESC);

-- Trigger: snapshot automático quando ai_payload muda
CREATE OR REPLACE FUNCTION public.tg_snapshot_ai_payload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version integer;
BEGIN
  IF NEW.ai_payload IS NULL THEN
    RETURN NEW;
  END IF;
  IF OLD.ai_payload IS NOT DISTINCT FROM NEW.ai_payload THEN
    RETURN NEW;
  END IF;
  SELECT COALESCE(MAX(version), 0) + 1
    INTO next_version
    FROM public.ai_draft_versions
   WHERE draft_id = NEW.id;
  INSERT INTO public.ai_draft_versions (draft_id, version, ai_payload, change_kind, author_id)
  VALUES (
    NEW.id,
    next_version,
    NEW.ai_payload,
    CASE
      WHEN OLD.ai_payload IS NULL THEN 'initial'
      WHEN NEW.status = 'published' THEN 'publish'
      ELSE 'edit'
    END,
    auth.uid()
  );
  RETURN NEW;
END $$;

CREATE TRIGGER ai_course_drafts_snapshot
  AFTER UPDATE OF ai_payload ON public.ai_course_drafts
  FOR EACH ROW EXECUTE FUNCTION public.tg_snapshot_ai_payload();

-- =====================================================
-- 2. Auditoria do pipeline IA
-- =====================================================
CREATE TABLE public.ai_pipeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid REFERENCES public.ai_course_drafts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind text NOT NULL,
  message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.ai_pipeline_events TO authenticated;
GRANT ALL ON public.ai_pipeline_events TO service_role;

ALTER TABLE public.ai_pipeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read pipeline events"
  ON public.ai_pipeline_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ai_pipeline_events_user_time
  ON public.ai_pipeline_events(user_id, kind, created_at DESC);
CREATE INDEX idx_ai_pipeline_events_draft
  ON public.ai_pipeline_events(draft_id, created_at DESC);

-- Função auxiliar de quota
CREATE OR REPLACE FUNCTION public.ai_jobs_in_window(
  p_user_id uuid,
  p_kinds text[],
  p_minutes integer
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.ai_pipeline_events
  WHERE user_id = p_user_id
    AND kind = ANY(p_kinds)
    AND created_at >= now() - make_interval(mins => p_minutes);
$$;

-- =====================================================
-- 3. Publicação transacional
-- =====================================================
CREATE OR REPLACE FUNCTION public.publish_course_draft(
  p_draft_id uuid,
  p_track_id uuid,
  p_passing_score integer,
  p_question_count integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_draft public.ai_course_drafts%ROWTYPE;
  v_payload jsonb;
  v_title text;
  v_description text;
  v_hours numeric;
  v_modules jsonb;
  v_questions jsonb;
  v_base_slug text;
  v_slug text;
  v_attempt integer := 1;
  v_course_id uuid;
  v_module_record jsonb;
  v_module_id uuid;
  v_module_idx integer := 0;
  v_module_count integer := 0;
  v_question_record jsonb;
  v_question_count_in integer := 0;
  v_final_question_count integer;
BEGIN
  IF v_caller IS NULL OR NOT public.has_role(v_caller, 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_draft FROM public.ai_course_drafts WHERE id = p_draft_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'draft not found';
  END IF;
  IF v_draft.status = 'published' THEN
    RAISE EXCEPTION 'draft already published';
  END IF;
  IF v_draft.ai_payload IS NULL THEN
    RAISE EXCEPTION 'draft has no payload';
  END IF;

  v_payload     := v_draft.ai_payload;
  v_title       := v_payload->>'title';
  v_description := v_payload->>'description';
  v_hours       := COALESCE((v_payload->>'hoursLoad')::numeric, 0);
  v_modules     := COALESCE(v_payload->'modules', '[]'::jsonb);
  v_questions   := COALESCE(v_payload->'questionBank', '[]'::jsonb);

  IF v_title IS NULL OR length(v_title) = 0 THEN
    RAISE EXCEPTION 'payload missing title';
  END IF;
  IF jsonb_array_length(v_modules) = 0 THEN
    RAISE EXCEPTION 'payload missing modules';
  END IF;
  IF jsonb_array_length(v_questions) = 0 THEN
    RAISE EXCEPTION 'payload missing questions';
  END IF;

  -- slugify
  v_base_slug := regexp_replace(lower(unaccent(v_title)), '[^a-z0-9]+', '-', 'g');
  v_base_slug := regexp_replace(v_base_slug, '(^-|-$)', '', 'g');
  IF length(v_base_slug) = 0 THEN
    v_base_slug := 'curso-' || floor(extract(epoch from now()))::text;
  END IF;
  v_base_slug := substr(v_base_slug, 1, 60);
  v_slug := v_base_slug;
  WHILE EXISTS (SELECT 1 FROM public.courses WHERE slug = v_slug) AND v_attempt < 50 LOOP
    v_attempt := v_attempt + 1;
    v_slug := v_base_slug || '-' || v_attempt::text;
  END LOOP;

  INSERT INTO public.courses (slug, title, description, hours_load, track_id, order_index)
  VALUES (v_slug, v_title, v_description, v_hours, p_track_id, 0)
  RETURNING id INTO v_course_id;

  FOR v_module_record IN SELECT * FROM jsonb_array_elements(v_modules) LOOP
    INSERT INTO public.modules (course_id, slug, title, content, order_index)
    VALUES (
      v_course_id,
      regexp_replace(lower(unaccent(coalesce(v_module_record->>'title','modulo'))), '[^a-z0-9]+', '-', 'g') || '-' || (v_module_idx + 1)::text,
      coalesce(v_module_record->>'title', 'Módulo ' || (v_module_idx + 1)::text),
      concat_ws(E'\n\n',
        nullif(v_module_record->>'summary',''),
        nullif(v_module_record->>'content','')),
      v_module_idx
    )
    RETURNING id INTO v_module_id;

    INSERT INTO public.lessons (module_id, slug, title, content, order_index)
    VALUES (
      v_module_id,
      'introducao',
      coalesce(v_module_record->>'title', 'Aula 1'),
      concat_ws(E'\n\n',
        nullif(v_module_record->>'summary',''),
        nullif(v_module_record->>'content','')),
      0
    );

    v_module_idx := v_module_idx + 1;
  END LOOP;
  v_module_count := v_module_idx;

  FOR v_question_record IN SELECT * FROM jsonb_array_elements(v_questions) LOOP
    INSERT INTO public.questions (course_id, stem, options, correct_index, explanation)
    VALUES (
      v_course_id,
      v_question_record->>'stem',
      v_question_record->'options',
      (v_question_record->>'correctIndex')::int,
      coalesce(v_question_record->>'explanation','')
    );
    v_question_count_in := v_question_count_in + 1;
  END LOOP;

  v_final_question_count := LEAST(coalesce(p_question_count, 10), v_question_count_in);

  INSERT INTO public.course_exams
    (course_id, passing_score, question_count, shuffle_seed_strategy, published)
  VALUES
    (v_course_id, coalesce(p_passing_score, 70), v_final_question_count, 'random', true);

  UPDATE public.ai_course_drafts
     SET status = 'published',
         course_id = v_course_id
   WHERE id = p_draft_id;

  INSERT INTO public.ai_pipeline_events (draft_id, user_id, kind, message, metadata)
  VALUES (
    p_draft_id, v_caller, 'publish',
    'course published',
    jsonb_build_object(
      'course_id', v_course_id,
      'slug', v_slug,
      'modules', v_module_count,
      'questions', v_question_count_in
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'courseId', v_course_id,
    'slug', v_slug,
    'modules', v_module_count,
    'questions', v_question_count_in,
    'passingScore', coalesce(p_passing_score, 70),
    'questionCount', v_final_question_count
  );
END $$;

-- unaccent é necessária para o slugify
CREATE EXTENSION IF NOT EXISTS unaccent;

REVOKE ALL ON FUNCTION public.publish_course_draft(uuid, uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_course_draft(uuid, uuid, integer, integer) TO authenticated;

-- Backfill: snapshot inicial dos drafts já existentes
INSERT INTO public.ai_draft_versions (draft_id, version, ai_payload, change_kind, author_id)
SELECT id, 1, ai_payload, 'initial', created_by
  FROM public.ai_course_drafts
 WHERE ai_payload IS NOT NULL
 ON CONFLICT DO NOTHING;
