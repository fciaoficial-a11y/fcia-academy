import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, RefreshCw, FileText } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { PdfUploadDropzone } from "@/components/admin/PdfUploadDropzone";
import { AIDraftReview, type AiDraftPayload } from "@/components/admin/AIDraftReview";
import {
  uploadCoursePdf,
  listCourseDrafts,
  generateCourseDraft,
  getCourseDraft,
} from "@/lib/ai-study.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/ai-studio/pdf-to-course")({
  head: () => ({
    meta: [
      { title: "PDF → Curso (IA) — Admin FCIA Academy" },
      { name: "description", content: "Transforme PDFs em cursos estruturados com IA." },
    ],
  }),
  component: PdfToCoursePage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      resolve(r.split(",")[1] ?? r);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    uploaded: "bg-secondary text-foreground",
    extracting: "bg-secondary text-foreground",
    generating: "bg-primary/15 text-primary",
    ready_for_review: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30",
    error: "bg-destructive/15 text-destructive",
  };
  const label: Record<string, string> = {
    uploaded: "Enviado",
    extracting: "Extraindo",
    generating: "Gerando IA",
    ready_for_review: "Pronto p/ revisão",
    error: "Erro",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider", map[status] ?? "bg-secondary text-foreground")}>
      {label[status] ?? status}
    </span>
  );
}

function PdfToCoursePage() {
  const qc = useQueryClient();
  const upload = useServerFn(uploadCoursePdf);
  const generate = useServerFn(generateCourseDraft);
  const list = useServerFn(listCourseDrafts);
  const getDraft = useServerFn(getCourseDraft);

  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const draftsQ = useQuery({
    queryKey: ["ai-course-drafts"],
    queryFn: () => list(),
  });

  const activeDraftQ = useQuery({
    queryKey: ["ai-course-draft", activeDraftId],
    queryFn: () => getDraft({ data: { draftId: activeDraftId! } }),
    enabled: !!activeDraftId,
  });

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const contentBase64 = await fileToBase64(file);
      return upload({ data: { filename: file.name, contentBase64 } });
    },
    onSuccess: (res) => {
      toast.success(`Upload concluído: ${res.filename}`);
      setActiveDraftId(res.draftId);
      qc.invalidateQueries({ queryKey: ["ai-course-drafts"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Falha no upload"),
  });

  const generateMut = useMutation({
    mutationFn: (draftId: string) => generate({ data: { draftId } }),
    onSuccess: (res) => {
      toast.success("Draft gerado com sucesso");
      setActiveDraftId(res.draftId);
      qc.invalidateQueries({ queryKey: ["ai-course-drafts"] });
      qc.invalidateQueries({ queryKey: ["ai-course-draft", res.draftId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Falha ao gerar"),
  });

  const drafts = draftsQ.data ?? [];
  const activePayload = activeDraftQ.data?.ai_payload as AiDraftPayload | null | undefined;

  return (
    <AdminShell>
      <PageHeader
        crumbs={[
          { label: "Admin", to: "/admin" },
          { label: "AI Studio", to: "/admin/ai-studio" },
          { label: "PDF → Curso" },
        ]}
        eyebrow="AI Studio"
        title="PDF → Curso com IA"
        description="Faça upload de um PDF, extraia o conteúdo e gere um curso estruturado pronto para revisão."
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <PdfUploadDropzone
            onUpload={(file) => uploadMut.mutateAsync(file).then(() => undefined)}
            disabled={uploadMut.isPending}
          />
          <p className="text-xs text-muted-foreground">
            O PDF é salvo em bucket privado. Nada é publicado automaticamente — você revisa antes.
          </p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <header className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-foreground">Drafts recentes</h3>
            <button
              onClick={() => draftsQ.refetch()}
              className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] text-foreground hover:bg-secondary"
            >
              <RefreshCw className="h-3 w-3" /> Atualizar
            </button>
          </header>

          {draftsQ.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
          ) : draftsQ.isError ? (
            <p className="mt-4 text-sm text-destructive">Erro: {(draftsQ.error as Error).message}</p>
          ) : drafts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum draft ainda. Envie um PDF para começar.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {drafts.map((d: any) => {
                const isActive = d.id === activeDraftId;
                const canGenerate = d.status === "uploaded" || d.status === "error";
                return (
                  <li
                    key={d.id}
                    className={cn(
                      "rounded-2xl border p-3 transition-colors",
                      isActive ? "border-primary/40 bg-primary/5" : "border-border/50 bg-background/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-xs text-foreground" title={d.pdf_path}>
                          {d.pdf_path}
                        </span>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => generateMut.mutate(d.id)}
                        disabled={!canGenerate || (generateMut.isPending && generateMut.variables === d.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground transition-opacity disabled:opacity-50"
                      >
                        <Sparkles className="h-3 w-3" />
                        {generateMut.isPending && generateMut.variables === d.id ? "Gerando…" : "Gerar com IA"}
                      </button>
                      <button
                        onClick={() => setActiveDraftId(d.id)}
                        disabled={d.status !== "ready_for_review" && d.status !== "published"}
                        className="inline-flex items-center rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-medium text-foreground hover:bg-secondary disabled:opacity-50"
                      >
                        Pré-visualizar
                      </button>
                      <Link
                        to="/admin/ai-studio/drafts/$id"
                        params={{ id: d.id }}
                        className={cn(
                          "inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/20",
                          d.status !== "ready_for_review" && d.status !== "published" && "pointer-events-none opacity-50",
                        )}
                      >
                        Revisar & publicar
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Link to="/admin/ai-studio" className="mt-4 inline-block text-xs text-primary hover:underline">
            ← Voltar ao AI Studio
          </Link>
        </div>
      </section>

      <section>
        {activeDraftId && activeDraftQ.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando draft…</p>
        )}
        {activeDraftId && activeDraftQ.isError && (
          <p className="text-sm text-destructive">Erro: {(activeDraftQ.error as Error).message}</p>
        )}
        {activePayload ? (
          <AIDraftReview payload={activePayload} />
        ) : activeDraftId && activeDraftQ.data ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
            Draft em status <strong>{activeDraftQ.data.status}</strong>. Clique em "Gerar com IA" para produzir o conteúdo estruturado.
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}