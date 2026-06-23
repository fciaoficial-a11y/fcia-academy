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

const GENERATION_LIMIT_PER_HOUR = 10;

async function logEvent(
  admin: any,
  draftId: string | null,
  userId: string,
  kind: string,
  message: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await admin.from("ai_pipeline_events").insert({
      draft_id: draftId,
      user_id: userId,
      kind,
      message,
      metadata: metadata ?? null,
    });
  } catch {
    // auditoria nunca pode quebrar o pipeline
  }
}

async function assertWithinQuota(admin: any, userId: string) {
  const { data, error } = await admin.rpc("ai_jobs_in_window", {
    p_user_id: userId,
    p_kinds: ["generate", "regenerate"],
    p_minutes: 60,
  });
  if (error) return; // se quota falhar, não bloqueia (auditoria já registra)
  const count = typeof data === "number" ? data : Number(data ?? 0);
  if (count >= GENERATION_LIMIT_PER_HOUR) {
    throw new Error(
      `Limite de ${GENERATION_LIMIT_PER_HOUR} gerações por hora atingido. Aguarde antes de tentar novamente.`,
    );
  }
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

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || `curso-${Date.now()}`;
}

const PayloadShape = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  objectives: z.array(z.string()),
  hoursLoad: z.number(),
  modules: z.array(
    z.object({
      title: z.string().min(1),
      summary: z.string().default(""),
      content: z.string().default(""),
      exercises: z.array(z.string()).default([]),
    }),
  ).min(1),
  questionBank: z.array(
    z.object({
      stem: z.string().min(1),
      options: z.array(z.string()).length(4),
      correctIndex: z.number().int().min(0).max(3),
      explanation: z.string().default(""),
    }),
  ).min(1),
  certificateTemplate: z.object({
    heading: z.string(),
    body: z.string(),
    signature: z.string(),
  }),
});

const PublishInput = z.object({
  draftId: z.string().uuid(),
  overrides: PayloadShape.partial().optional(),
  trackId: z.string().uuid().nullish(),
  passingScore: z.number().int().min(1).max(100).optional(),
  questionCount: z.number().int().min(1).max(50).optional(),
});

const UpdateDraftInput = z.object({
  draftId: z.string().uuid(),
  payload: PayloadShape,
});

export const updateCourseDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateDraftInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ai_course_drafts")
      .update({ ai_payload: data.payload as any })
      .eq("id", data.draftId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const publishCourseDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PublishInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: draft, error: dErr } = await supabaseAdmin
      .from("ai_course_drafts")
      .select("id, status, ai_payload, course_id")
      .eq("id", data.draftId)
      .maybeSingle();
    if (dErr || !draft) throw new Error("Draft não encontrado");
    if (draft.status === "published") throw new Error("Draft já publicado");
    if (!draft.ai_payload) throw new Error("Draft ainda não está pronto para revisão");

    const merged = { ...(draft.ai_payload as any), ...(data.overrides ?? {}) };
    const payload = PayloadShape.parse(merged);

    // unique slug
    let baseSlug = slugify(payload.title);
    let slug = baseSlug;
    for (let i = 2; i < 50; i++) {
      const { data: hit } = await supabaseAdmin
        .from("courses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!hit) break;
      slug = `${baseSlug}-${i}`;
    }

    // 1) course
    const { data: course, error: cErr } = await supabaseAdmin
      .from("courses")
      .insert({
        slug,
        title: payload.title,
        description: payload.description,
        hours_load: payload.hoursLoad,
        track_id: data.trackId ?? null,
        order_index: 0,
      })
      .select("id, slug")
      .single();
    if (cErr || !course) throw new Error(`Falha ao criar curso: ${cErr?.message}`);

    const rollback = async (msg: string) => {
      await supabaseAdmin.from("courses").delete().eq("id", course.id);
      throw new Error(msg);
    };

    // 2) modules
    const moduleRows = payload.modules.map((m, idx) => ({
      course_id: course.id,
      slug: `${slugify(m.title)}-${idx + 1}`,
      title: m.title,
      content: [m.summary, m.content, ...(m.exercises ?? []).map((e) => `- ${e}`)]
        .filter(Boolean)
        .join("\n\n"),
      order_index: idx,
    }));
    const { data: insertedModules, error: mErr } = await supabaseAdmin
      .from("modules")
      .insert(moduleRows)
      .select("id, order_index");
    if (mErr || !insertedModules) await rollback(`Falha ao criar módulos: ${mErr?.message}`);

    // 2b) one default lesson per module — granularidade mínima
    const lessonRows = (insertedModules ?? []).map((m: any) => {
      const src = payload.modules[m.order_index];
      return {
        module_id: m.id,
        slug: "introducao",
        title: src?.title ?? "Aula 1",
        content: [src?.summary, src?.content, ...(src?.exercises ?? []).map((e: string) => `- ${e}`)]
          .filter(Boolean)
          .join("\n\n"),
        order_index: 0,
      };
    });
    if (lessonRows.length > 0) {
      const { error: lErr } = await supabaseAdmin.from("lessons").insert(lessonRows);
      if (lErr) await rollback(`Falha ao criar aulas: ${lErr.message}`);
    }

    // 3) questions
    const questionRows = payload.questionBank.map((q) => ({
      course_id: course.id,
      stem: q.stem,
      options: q.options as any,
      correct_index: q.correctIndex,
      explanation: q.explanation,
    }));
    const { error: qErr } = await supabaseAdmin.from("questions").insert(questionRows);
    if (qErr) await rollback(`Falha ao criar questões: ${qErr.message}`);

    // 4) exam config
    const questionCount = Math.min(data.questionCount ?? 10, payload.questionBank.length);
    const { error: eErr } = await supabaseAdmin.from("course_exams").insert({
      course_id: course.id,
      passing_score: data.passingScore ?? 70,
      question_count: questionCount,
      shuffle_seed_strategy: "random",
      published: true,
    });
    if (eErr) await rollback(`Falha ao criar prova: ${eErr.message}`);

    // 5) update draft → published (certificate template lives inside ai_payload)
    const finalPayload = { ...payload, certificateTemplate: payload.certificateTemplate };
    const { error: updErr } = await supabaseAdmin
      .from("ai_course_drafts")
      .update({
        status: "published",
        course_id: course.id,
        ai_payload: finalPayload as any,
      })
      .eq("id", draft.id);
    if (updErr) await rollback(`Falha ao atualizar draft: ${updErr.message}`);

    return {
      ok: true,
      courseId: course.id,
      slug: course.slug,
      modules: moduleRows.length,
      questions: questionRows.length,
      passingScore: data.passingScore ?? 70,
      questionCount,
    };
  });

// =====================================================
// FASE 4 — Prova do aluno (server-side scoring)
// =====================================================

const StartExamInput = z.object({ courseId: z.string().uuid() });
const SubmitExamInput = z.object({
  attemptId: z.string().uuid(),
  answers: z.array(z.object({ questionId: z.string().uuid(), selectedIndex: z.number().int().min(0).max(3) })),
});
const CourseIdInput = z.object({ courseId: z.string().uuid() });

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const startExamAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StartExamInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // matrícula
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .maybeSingle();
    if (!enr) throw new Error("Você não está matriculado neste curso");

    // prova liberada
    const { data: exam } = await supabaseAdmin
      .from("course_exams")
      .select("question_count, passing_score, published")
      .eq("course_id", data.courseId)
      .maybeSingle();
    if (!exam || !exam.published) throw new Error("Prova não disponível");

    // bloqueio após aprovação
    const { data: approved } = await supabaseAdmin
      .from("exam_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .eq("passed", true)
      .maybeSingle();
    if (approved) throw new Error("Você já foi aprovado neste curso");

    // sorteio
    const { data: pool, error: qErr } = await supabaseAdmin
      .from("questions")
      .select("id, stem, options")
      .eq("course_id", data.courseId);
    if (qErr) throw new Error(qErr.message);
    if (!pool || pool.length === 0) throw new Error("Curso sem questões cadastradas");

    const n = Math.min(exam.question_count ?? 10, pool.length);
    const picked = shuffle(pool).slice(0, n);
    const questionIds = picked.map((q) => q.id);

    // cria tentativa (RLS student insert)
    const { data: attempt, error: aErr } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: userId,
        course_id: data.courseId,
        question_ids: questionIds,
        passed: false,
      })
      .select("id, started_at")
      .single();
    if (aErr || !attempt) throw new Error(aErr?.message ?? "Falha ao criar tentativa");

    return {
      attemptId: attempt.id,
      startedAt: attempt.started_at,
      passingScore: exam.passing_score ?? 70,
      questions: picked.map((q) => ({ id: q.id, stem: q.stem, options: q.options })),
    };
  });

export const submitExamAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SubmitExamInput.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("exam_attempts")
      .select("id, user_id, course_id, question_ids, finished_at, passed")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (aErr || !attempt) throw new Error("Tentativa não encontrada");
    if (attempt.user_id !== userId) throw new Error("Forbidden");
    if (attempt.finished_at) throw new Error("Tentativa já finalizada");

    // bloqueio se já aprovado em outra tentativa
    const { data: prior } = await supabaseAdmin
      .from("exam_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", attempt.course_id)
      .eq("passed", true)
      .maybeSingle();
    if (prior) throw new Error("Você já foi aprovado neste curso");

    const ids: string[] = attempt.question_ids ?? [];
    const { data: qs, error: qErr } = await supabaseAdmin
      .from("questions")
      .select("id, correct_index, explanation, stem, options")
      .in("id", ids);
    if (qErr || !qs) throw new Error("Falha ao carregar questões");

    const byId = new Map(qs.map((q) => [q.id, q]));
    const answerMap = new Map(data.answers.map((a) => [a.questionId, a.selectedIndex]));

    let correct = 0;
    const results = ids.map((qid) => {
      const q = byId.get(qid);
      const sel = answerMap.get(qid);
      const ok = q && sel === q.correct_index;
      if (ok) correct++;
      return {
        questionId: qid,
        stem: q?.stem ?? "",
        options: q?.options ?? [],
        selectedIndex: sel ?? -1,
        correctIndex: q?.correct_index ?? -1,
        correct: !!ok,
        explanation: q?.explanation ?? "",
      };
    });

    const { data: exam } = await supabaseAdmin
      .from("course_exams")
      .select("passing_score")
      .eq("course_id", attempt.course_id)
      .maybeSingle();
    const passingScore = exam?.passing_score ?? 70;
    const score = Number(((correct / ids.length) * 100).toFixed(2));
    const passed = score >= passingScore;

    const { error: uErr } = await supabaseAdmin
      .from("exam_attempts")
      .update({
        score,
        passed,
        finished_at: new Date().toISOString(),
        answers: results as any,
      })
      .eq("id", attempt.id);
    if (uErr) throw new Error(uErr.message);

    let certificate: { code: string; id: string } | null = null;
    if (passed) {
      const { data: course } = await supabaseAdmin
        .from("courses")
        .select("hours_load")
        .eq("id", attempt.course_id)
        .maybeSingle();
      const code = `FCIA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const qr_payload = JSON.stringify({ code, userId, courseId: attempt.course_id, attemptId: attempt.id });
      const { data: cert, error: cErr } = await supabaseAdmin
        .from("issued_certificates")
        .upsert(
          {
            user_id: userId,
            course_id: attempt.course_id,
            attempt_id: attempt.id,
            code,
            qr_payload,
            hours_load: course?.hours_load ?? null,
          },
          { onConflict: "user_id,course_id" },
        )
        .select("id, code")
        .single();
      if (!cErr && cert) certificate = { id: cert.id, code: cert.code };
    }

    return {
      score,
      passed,
      passingScore,
      correct,
      total: ids.length,
      results,
      certificate,
    };
  });

export const listMyAttempts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CourseIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: rows, error } = await supabase
      .from("exam_attempts")
      .select("id, started_at, finished_at, score, passed")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .order("started_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getMyCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CourseIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: cert } = await supabase
      .from("issued_certificates")
      .select("id, code, qr_payload, issued_at, hours_load")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .maybeSingle();
    return cert ?? null;
  });

const CodeInput = z.object({ code: z.string().min(4).max(80) });

export const getCertificateByCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CodeInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cert, error } = await supabaseAdmin
      .from("issued_certificates")
      .select("id, code, issued_at, hours_load, user_id, course_id")
      .eq("code", data.code)
      .maybeSingle();
    if (error || !cert) return { valid: false as const };

    const [{ data: course }, { data: profile }] = await Promise.all([
      supabaseAdmin.from("courses").select("title, hours_load").eq("id", cert.course_id).maybeSingle(),
      supabaseAdmin.from("profiles").select("full_name").eq("id", cert.user_id).maybeSingle(),
    ]);

    return {
      valid: true as const,
      code: cert.code,
      studentName: profile?.full_name ?? "Aluno FCIA",
      courseName: course?.title ?? "Curso FCIA",
      issuedAt: cert.issued_at,
      hoursLoad: cert.hours_load ?? course?.hours_load ?? null,
    };
  });