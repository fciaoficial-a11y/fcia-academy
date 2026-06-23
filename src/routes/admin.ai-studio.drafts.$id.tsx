import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Rocket, Save, ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { AIDraftReview, type AiDraftPayload } from "@/components/admin/AIDraftReview";
import {
  getCourseDraft,
  updateCourseDraft,
  publishCourseDraft,
} from "@/lib/ai-study.functions";

export const Route = createFileRoute("/admin/ai-studio/drafts/$id")({
  head: () => ({
    meta: [{ title: "Revisar draft — AI Studio" }],
  }),
  component: DraftReviewPage,
});

function DraftReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getDraft = useServerFn(getCourseDraft);
  const saveDraft = useServerFn(updateCourseDraft);
  const publish = useServerFn(publishCourseDraft);

  const draftQ = useQuery({
    queryKey: ["ai-course-draft", id],
    queryFn: () => getDraft({ data: { draftId: id } }),
  });

  const [payload, setPayload] = useState<AiDraftPayload | null>(null);
  const [passingScore, setPassingScore] = useState(70);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    const p = draftQ.data?.ai_payload as AiDraftPayload | null;
    if (p) setPayload(p);
  }, [draftQ.data]);

  const saveMut = useMutation({
    mutationFn: () => saveDraft({ data: { draftId: id, payload: payload! } }),
    onSuccess: () => {
      toast.success("Ajustes salvos");
      qc.invalidateQueries({ queryKey: ["ai-course-draft", id] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Falha ao salvar"),
  });

  const pubMut = useMutation({
    mutationFn: () =>
      publish({
        data: {
          draftId: id,
          overrides: payload ?? undefined,
          passingScore,
          questionCount,
        },
      }),
    onSuccess: (res) => {
      toast.success(`Curso publicado: ${res.slug}`);
      qc.invalidateQueries({ queryKey: ["ai-course-drafts"] });
      qc.invalidateQueries({ queryKey: ["ai-course-draft", id] });
      navigate({ to: "/admin/cursos" }).catch(() => {});
    },
    onError: (e: any) => toast.error(e?.message ?? "Falha ao publicar"),
  });

  const status = draftQ.data?.status;
  const canPublish = status === "ready_for_review" && !!payload;
  const isPublished = status === "published";

  return (
    <AdminShell>
      <PageHeader
        crumbs={[
          { label: "Admin", to: "/admin" },
          { label: "AI Studio", to: "/admin/ai-studio" },
          { label: "PDF → Curso", to: "/admin/ai-studio/pdf-to-course" },
          { label: "Revisar draft" },
        ]}
        eyebrow="AI Studio"
        title="Revisão e publicação do draft"
        description="Ajuste título, descrição e configure a prova antes de publicar o curso."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          to="/admin/ai-studio/pdf-to-course"
          className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para drafts
        </Link>
        <span className="rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          status: {status ?? "—"}
        </span>
      </div>

      {draftQ.isLoading && (
        <p className="text-sm text-muted-foreground">Carregando draft…</p>
      )}
      {draftQ.isError && (
        <p className="text-sm text-destructive">Erro: {(draftQ.error as Error).message}</p>
      )}
      {draftQ.data && !payload && (
        <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
          Draft em status <strong>{status}</strong>. Gere o conteúdo com IA antes de publicar.
        </div>
      )}

      {payload && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-4">
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <h3 className="font-display text-sm font-semibold text-foreground">Ajustes rápidos</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-muted-foreground">
                  Título
                  <input
                    value={payload.title}
                    onChange={(e) => setPayload({ ...payload, title: e.target.value })}
                    className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Carga horária (h)
                  <input
                    type="number"
                    min={1}
                    value={payload.hoursLoad}
                    onChange={(e) =>
                      setPayload({ ...payload, hoursLoad: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="sm:col-span-2 space-y-1 text-xs text-muted-foreground">
                  Descrição
                  <textarea
                    rows={3}
                    value={payload.description}
                    onChange={(e) => setPayload({ ...payload, description: e.target.value })}
                    className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>
            </div>

            <AIDraftReview payload={payload} />
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <h3 className="font-display text-sm font-semibold text-foreground">Configuração da prova</h3>
              <div className="mt-3 grid gap-3">
                <label className="space-y-1 text-xs text-muted-foreground">
                  Nota mínima (%)
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value) || 70)}
                    className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Nº de questões sorteadas
                  <input
                    type="number"
                    min={1}
                    max={payload.questionBank.length}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value) || 10)}
                    className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Banco com {payload.questionBank.length} questões.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <h3 className="font-display text-sm font-semibold text-foreground">Ações</h3>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => saveMut.mutate()}
                  disabled={saveMut.isPending || isPublished}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:bg-secondary/80 disabled:opacity-50"
                >
                  {saveMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar ajustes
                </button>
                <button
                  onClick={() => pubMut.mutate()}
                  disabled={!canPublish || pubMut.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {pubMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Rocket className="h-4 w-4" />
                  )}
                  Publicar curso
                </button>
                {isPublished && (
                  <p className="text-[11px] text-primary">Draft já publicado.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}