import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MAX_PDF_MB = 15;

const UploadInput = z.object({
  filename: z.string().min(1).max(200),
  contentBase64: z.string().min(10),
});

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Falha ao verificar permissão");
  if (!data) throw new Error("Forbidden: admin role required");
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.split(",")[1] : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const uploadCoursePdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UploadInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const bytes = base64ToBytes(data.contentBase64);
    if (bytes.byteLength > MAX_PDF_MB * 1024 * 1024) {
      throw new Error(`PDF excede ${MAX_PDF_MB}MB`);
    }
    // PDF magic: %PDF
    if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
      throw new Error("Arquivo não é um PDF válido");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const draftId = crypto.randomUUID();
    const pdfPath = `${draftId}.pdf`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("course-pdfs")
      .upload(pdfPath, bytes, { contentType: "application/pdf", upsert: false });
    if (upErr) throw new Error(`Falha no upload: ${upErr.message}`);

    const { error: insErr } = await supabaseAdmin.from("ai_course_drafts").insert({
      id: draftId,
      created_by: userId,
      pdf_path: pdfPath,
      status: "uploaded",
    });
    if (insErr) {
      await supabaseAdmin.storage.from("course-pdfs").remove([pdfPath]);
      throw new Error(`Falha ao registrar draft: ${insErr.message}`);
    }
    return { draftId, filename: data.filename };
  });

export const listCourseDrafts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ai_course_drafts")
      .select("id, pdf_path, status, ai_payload, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getCourseDraft = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ draftId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("ai_course_drafts")
      .select("*")
      .eq("id", data.draftId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Draft não encontrado");
    return row;
  });

export const generateCourseDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ draftId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: draft, error: dErr } = await supabaseAdmin
      .from("ai_course_drafts")
      .select("id, pdf_path, status")
      .eq("id", data.draftId)
      .maybeSingle();
    if (dErr || !draft) throw new Error("Draft não encontrado");

    await supabaseAdmin
      .from("ai_course_drafts")
      .update({ status: "extracting" })
      .eq("id", draft.id);

    // Download PDF
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("course-pdfs")
      .download(draft.pdf_path);
    if (dlErr || !blob) throw new Error(`Falha ao baixar PDF: ${dlErr?.message}`);
    const arr = new Uint8Array(await blob.arrayBuffer());

    // Extract text
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(arr);
    const { text } = await extractText(pdf, { mergePages: true });
    const rawText = (Array.isArray(text) ? text.join("\n\n") : text).slice(0, 60_000);
    if (!rawText.trim()) throw new Error("Não foi possível extrair texto do PDF");

    await supabaseAdmin
      .from("ai_course_drafts")
      .update({ raw_extracted_text: rawText, status: "generating" })
      .eq("id", draft.id);

    // AI generation
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");
    const { generateText, Output } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    const schema = z.object({
      title: z.string(),
      description: z.string(),
      objectives: z.array(z.string()).min(3).max(10),
      hoursLoad: z.number().int().min(1).max(200),
      modules: z.array(
        z.object({
          title: z.string(),
          summary: z.string(),
          content: z.string(),
          exercises: z.array(z.string()),
        }),
      ).min(2).max(8),
      questionBank: z.array(
        z.object({
          stem: z.string(),
          options: z.array(z.string()).length(4),
          correctIndex: z.number().int().min(0).max(3),
          explanation: z.string(),
        }),
      ).min(10).max(20),
      certificateTemplate: z.object({
        heading: z.string(),
        body: z.string(),
        signature: z.string(),
      }),
    });

    let payload: z.infer<typeof schema>;
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        output: Output.object({ schema }),
        system:
          "Você é um designer instrucional sênior. Gere um curso estruturado em PT-BR a partir do material fornecido. Seja objetivo, didático e fiel ao conteúdo.",
        prompt: `Material do curso (texto extraído de PDF):\n\n${rawText}`,
      });
      payload = output as z.infer<typeof schema>;
    } catch (e: any) {
      await supabaseAdmin
        .from("ai_course_drafts")
        .update({ status: "error" })
        .eq("id", draft.id);
      const msg = String(e?.message ?? e);
      if (msg.includes("429")) throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
      if (msg.includes("402")) throw new Error("Créditos da IA esgotados. Adicione créditos no workspace.");
      throw new Error(`Falha na geração: ${msg}`);
    }

    const { error: updErr } = await supabaseAdmin
      .from("ai_course_drafts")
      .update({ ai_payload: payload as any, status: "ready_for_review" })
      .eq("id", draft.id);
    if (updErr) throw new Error(updErr.message);

    return { draftId: draft.id, payload };
  });