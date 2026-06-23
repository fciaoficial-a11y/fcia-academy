
-- 1) Add price + access columns to courses & enrollments
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 19700,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'BRL';

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS access_status text NOT NULL DEFAULT 'active'
    CHECK (access_status IN ('pending','active')),
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- 2) Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  method text NOT NULL DEFAULT 'pix',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled','refunded','expired','in_process')),
  provider text NOT NULL DEFAULT 'mercado_pago',
  provider_payment_id text UNIQUE,
  qr_code text,
  qr_code_base64 text,
  ticket_url text,
  expires_at timestamptz,
  approved_at timestamptz,
  raw_event jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course ON public.payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users insert own payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) Idempotent payment processor (called by webhook with service_role)
CREATE OR REPLACE FUNCTION public.process_mercado_pago_payment(
  p_provider_payment_id text,
  p_status text,
  p_raw jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
BEGIN
  SELECT * INTO v_payment FROM public.payments
   WHERE provider_payment_id = p_provider_payment_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'payment_not_found');
  END IF;

  -- Idempotent: already approved
  IF v_payment.status = 'approved' AND p_status = 'approved' THEN
    RETURN jsonb_build_object('ok', true, 'already_processed', true);
  END IF;

  UPDATE public.payments
     SET status = p_status,
         raw_event = p_raw,
         approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE approved_at END,
         updated_at = now()
   WHERE id = v_payment.id;

  IF p_status = 'approved' THEN
    UPDATE public.enrollments
       SET access_status = 'active',
           paid_at = COALESCE(paid_at, now()),
           updated_at = now()
     WHERE id = v_payment.enrollment_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', p_status);
END $$;

REVOKE ALL ON FUNCTION public.process_mercado_pago_payment(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_mercado_pago_payment(text, text, jsonb) TO service_role;
