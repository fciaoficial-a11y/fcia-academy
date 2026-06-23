import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const MP_API = "https://api.mercadopago.com";

function statusFromMP(s: string | undefined): string {
  switch (s) {
    case "approved": return "approved";
    case "rejected": return "rejected";
    case "cancelled": return "cancelled";
    case "refunded": return "refunded";
    case "in_process": return "in_process";
    case "pending": return "pending";
    case "expired": return "expired";
    default: return "pending";
  }
}

function verifySignature(
  signatureHeader: string | null,
  requestId: string | null,
  dataId: string,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  const manifest = `id:${dataId};request-id:${requestId ?? ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(v1);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/webhooks/mercado-pago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
        const bodyText = await request.text();

        let body: any = {};
        try { body = JSON.parse(bodyText); } catch { /* ignore */ }

        const url = new URL(request.url);
        const dataId =
          body?.data?.id?.toString() ??
          url.searchParams.get("data.id") ??
          url.searchParams.get("id") ??
          "";

        if (!accessToken || !webhookSecret) {
          return new Response("Provider not configured", { status: 503 });
        }
        if (!dataId) return new Response("Missing data.id", { status: 400 });

        const sigOk = verifySignature(
          request.headers.get("x-signature"),
          request.headers.get("x-request-id"),
          dataId,
          webhookSecret,
        );
        if (!sigOk) return new Response("Invalid signature", { status: 401 });

        // Only handle payment events
        const topic = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
        if (topic && topic !== "payment") return new Response("ok", { status: 200 });

        // Refetch from MP for trusted state
        const mpRes = await fetch(`${MP_API}/v1/payments/${dataId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!mpRes.ok) return new Response("Upstream error", { status: 502 });
        const payment = await mpRes.json();

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const status = statusFromMP(payment?.status);

        const { error } = await supabaseAdmin.rpc("process_mercado_pago_payment", {
          p_provider_payment_id: String(payment.id),
          p_status: status,
          p_raw: payment,
        });
        if (error) {
          console.error("[mp-webhook] rpc error", error);
          return new Response("DB error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});