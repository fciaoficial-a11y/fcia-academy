import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MP_API = "https://api.mercadopago.com";

function centsToBRL(cents: number) {
  return Math.round(cents) / 100;
}

export const createPixCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => z.object({ courseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load course (RLS: courses readable to all authenticated)
    const { data: course, error: cErr } = await supabase
      .from("courses")
      .select("id, title, price_cents, currency, slug")
      .eq("id", data.courseId)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!course) throw new Error("Curso não encontrado");

    // Ensure enrollment (pending)
    const { data: existingEnrollList, error: eqErr } = await supabase
      .from("enrollments")
      .select("id, access_status")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .limit(1);
    if (eqErr) throw new Error(eqErr.message);
    let enrollment = existingEnrollList?.[0];

    if (enrollment?.access_status === "active") {
      return { alreadyActive: true as const, enrollmentId: enrollment.id, courseSlug: course.slug };
    }

    if (!enrollment) {
      const { data: newEnroll, error: insErr } = await supabase
        .from("enrollments")
        .insert({ user_id: userId, course_id: course.id, access_status: "pending" })
        .select("id, access_status")
        .single();
      if (insErr) throw new Error(insErr.message);
      enrollment = newEnroll;
    }

    // Reuse a pending payment if one exists and not expired
    const { data: existingPayments } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .in("status", ["pending", "in_process"])
      .order("created_at", { ascending: false })
      .limit(1);
    const existing = existingPayments?.[0];
    if (existing && existing.expires_at && new Date(existing.expires_at).getTime() > Date.now()) {
      return {
        alreadyActive: false as const,
        paymentId: existing.id,
        enrollmentId: enrollment.id,
        qrCode: existing.qr_code,
        qrCodeBase64: existing.qr_code_base64,
        ticketUrl: existing.ticket_url,
        expiresAt: existing.expires_at,
        amountCents: existing.amount_cents,
      };
    }

    // Pre-create payment row to obtain id for external_reference
    const { data: paymentRow, error: pErr } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        course_id: course.id,
        enrollment_id: enrollment.id,
        amount_cents: course.price_cents,
        currency: course.currency,
        method: "pix",
        status: "pending",
        provider: "mercado_pago",
      })
      .select("*")
      .single();
    if (pErr) throw new Error(pErr.message);

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      // Keep pending payment row; surface a clear, controlled failure.
      throw new Error(
        "Pagamento indisponível: credenciais do provedor não configuradas. Aguardando integração.",
      );
    }

    // Get user email for payer
    const { data: { user } } = await supabase.auth.getUser();
    const payerEmail = user?.email ?? `user-${userId}@fcia.local`;

    const idempotencyKey = paymentRow.id;
    const mpRes = await fetch(`${MP_API}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        transaction_amount: centsToBRL(course.price_cents),
        description: `FCIA Academy — ${course.title}`,
        payment_method_id: "pix",
        external_reference: paymentRow.id,
        payer: { email: payerEmail },
        metadata: { user_id: userId, enrollment_id: enrollment.id, payment_id: paymentRow.id },
      }),
    });

    const mpJson = await mpRes.json().catch(() => ({}));
    if (!mpRes.ok) {
      await supabase
        .from("payments")
        .update({ status: "rejected", raw_event: mpJson })
        .eq("id", paymentRow.id);
      throw new Error(mpJson?.message || "Falha ao criar cobrança PIX");
    }

    const poi = mpJson?.point_of_interaction?.transaction_data ?? {};
    const update = {
      provider_payment_id: String(mpJson.id),
      qr_code: poi.qr_code ?? null,
      qr_code_base64: poi.qr_code_base64 ?? null,
      ticket_url: poi.ticket_url ?? null,
      expires_at: mpJson.date_of_expiration ?? null,
      status: (mpJson.status as string) ?? "pending",
      raw_event: mpJson,
    };
    await supabase.from("payments").update(update).eq("id", paymentRow.id);

    return {
      alreadyActive: false as const,
      paymentId: paymentRow.id,
      enrollmentId: enrollment.id,
      qrCode: update.qr_code,
      qrCodeBase64: update.qr_code_base64,
      ticketUrl: update.ticket_url,
      expiresAt: update.expires_at,
      amountCents: course.price_cents,
    };
  });

export const getPaymentStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { paymentId: string }) => z.object({ paymentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: pay, error } = await supabase
      .from("payments")
      .select("id, status, approved_at, expires_at, course_id, enrollment_id, amount_cents")
      .eq("id", data.paymentId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!pay) throw new Error("Pagamento não encontrado");
    return pay;
  });