import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { startExamAttempt, submitExamAttempt, listMyAttempts, getMyCertificate } from "@/lib/ai-study.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Award, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Question = { id: string; stem: string; options: string[] };
type StartResult = { attemptId: string; passingScore: number; questions: Question[] };
type ResultRow = {
  questionId: string;
  stem: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
};
type SubmitResult = {
  score: number;
  passed: boolean;
  passingScore: number;
  correct: number;
  total: number;
  results: ResultRow[];
  certificate: { id: string; code: string } | null;
};

export function ExamRunner({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const qc = useQueryClient();
  const startFn = useServerFn(startExamAttempt);
  const submitFn = useServerFn(submitExamAttempt);
  const listFn = useServerFn(listMyAttempts);
  const certFn = useServerFn(getMyCertificate);

  const attempts = useQuery({
    queryKey: ["exam-attempts", courseId],
    queryFn: () => listFn({ data: { courseId } }),
  });
  const cert = useQuery({
    queryKey: ["my-cert", courseId],
    queryFn: () => certFn({ data: { courseId } }),
  });

  const [active, setActive] = useState<StartResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);

  const startMut = useMutation({
    mutationFn: () => startFn({ data: { courseId } }) as Promise<StartResult>,
    onSuccess: (r) => {
      setActive(r);
      setAnswers({});
      setResult(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitMut = useMutation({
    mutationFn: () => {
      if (!active) throw new Error("Nenhuma tentativa ativa");
      const payload = active.questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] ?? -1 }));
      return submitFn({ data: { attemptId: active.attemptId, answers: payload } }) as Promise<SubmitResult>;
    },
    onSuccess: (r) => {
      setResult(r);
      setActive(null);
      qc.invalidateQueries({ queryKey: ["exam-attempts", courseId] });
      qc.invalidateQueries({ queryKey: ["my-cert", courseId] });
      toast[r.passed ? "success" : "info"](r.passed ? "Aprovado!" : `Nota ${r.score}% — abaixo de ${r.passingScore}%`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const attemptRows = (attempts.data ?? []) as Array<{ id: string; started_at: string; finished_at: string | null; score: number | null; passed: boolean }>;
  const certData = cert.data as { id: string; code: string; qr_payload: string; issued_at: string; hours_load: number | null } | null;
  const alreadyPassed = !!certData || attemptRows.some((a) => a.passed);
  const allAnswered = active ? active.questions.every((q) => typeof answers[q.id] === "number") : false;

  if (alreadyPassed && !result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Curso aprovado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Você foi aprovado neste curso. Nova submissão está bloqueada.</p>
          {certData && (
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Código: {certData.code}</Badge>
              <Button asChild size="sm"><Link to="/certificado/$id" params={{ id: certData.code }}>Ver certificado</Link></Button>
            </div>
          )}
          <AttemptsHistory rows={attemptRows} />
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.passed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}
              {result.passed ? "Aprovado" : "Reprovado"} — {result.score}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{result.correct} de {result.total} corretas · nota de corte {result.passingScore}%</p>
            {result.passed && result.certificate ? (
              <Button asChild><Link to="/certificado/$id" params={{ id: result.certificate.code }}>Acessar certificado</Link></Button>
            ) : (
              <Button onClick={() => startMut.mutate()} disabled={startMut.isPending}>
                <RefreshCw className="mr-2 h-4 w-4" /> Nova tentativa
              </Button>
            )}
          </CardContent>
        </Card>

        {!result.passed && (
          <Card>
            <CardHeader><CardTitle className="text-base">Revisão das erradas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
          {result.results.filter((r: ResultRow) => !r.correct).map((r: ResultRow, i: number) => (
                <div key={r.questionId} className="rounded-lg border border-border/60 p-4">
                  <p className="text-sm font-medium">{i + 1}. {r.stem}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Sua resposta: <span className="text-destructive">{r.options[r.selectedIndex] ?? "—"}</span></p>
                  <p className="text-xs text-muted-foreground">Correta: <span className="text-primary">{r.options[r.correctIndex]}</span></p>
                  {r.explanation && <p className="mt-2 text-xs text-muted-foreground">{r.explanation}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

            <AttemptsHistory rows={attemptRows} />
      </div>
    );
  }

  if (!active) {
    return (
      <Card>
        <CardHeader><CardTitle>Iniciar prova</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">10 questões aleatórias do banco do curso. Nota mínima de aprovação: 70%.</p>
          <Button onClick={() => startMut.mutate()} disabled={startMut.isPending}>
            {startMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Começar prova
          </Button>
        <AttemptsHistory rows={attemptRows} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {active.questions.map((q, idx) => (
        <Card key={q.id}>
          <CardHeader><CardTitle className="text-base">{idx + 1}. {q.stem}</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[q.id]?.toString() ?? ""}
              onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: Number(v) }))}
            >
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border border-border/40 p-3 hover:border-border">
                  <RadioGroupItem value={i.toString()} id={`${q.id}-${i}`} />
                  <Label htmlFor={`${q.id}-${i}`} className="cursor-pointer text-sm font-normal">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
      <div className="sticky bottom-4 flex items-center justify-between rounded-lg border border-border bg-card/95 p-4 backdrop-blur">
        <span className="text-sm text-muted-foreground">{Object.keys(answers).length} / {active.questions.length} respondidas</span>
        <Button onClick={() => submitMut.mutate()} disabled={!allAnswered || submitMut.isPending}>
          {submitMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Enviar respostas
        </Button>
      </div>
    </div>
  );
}

function AttemptsHistory({ rows }: { rows: Array<{ id: string; started_at: string; finished_at: string | null; score: number | null; passed: boolean }> }) {
  if (rows.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Histórico de tentativas</h3>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border border-border/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">{new Date(r.started_at).toLocaleString("pt-BR")}</span>
            <span className="flex items-center gap-2">
              {r.score != null ? `${r.score}%` : "em andamento"}
              {r.passed && <Badge variant="secondary" className="text-[10px]">Aprovado</Badge>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}