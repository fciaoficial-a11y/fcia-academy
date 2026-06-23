import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseCard } from "@/components/cards/CourseCard";
import { FilterChips } from "@/components/shared/FilterChips";
import { COURSES } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyAttempts, getMyCertificate } from "@/lib/ai-study.functions";
import { coursesQuery, normalize } from "@/lib/supabase-queries";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Award } from "lucide-react";

export const Route = createFileRoute("/meus-cursos")({
  head: () => ({ meta: [{ title: "Meus cursos — FCIA Academy" }, { name: "description", content: "Veja seus cursos em andamento e concluídos." }] }),
  component: MyCourses,
});

function MyCourses() {
  const enrolled = COURSES.filter((c) => c.progress > 0);
  const realCourses = useQuery(coursesQuery());
  return (
    <StudentShell>
      <PageHeader eyebrow="Aprendizado" title="Meus cursos" description={`${enrolled.length} cursos ativos`} />
      <FilterChips options={["Todos", "Em andamento", "Concluídos", "Favoritos"]} active="Todos" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {enrolled.map((c) => <CourseCard key={c.slug} course={c} />)}
      </div>
      <section className="space-y-3 rounded-xl border border-border/60 bg-card/50 p-5">
        <h2 className="text-sm font-semibold">Aprovações &amp; certificados</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(realCourses.data?.rows ?? []).map((row) => {
            const c = normalize(row);
            if (!c.id || !c.slug) return null;
            return <CourseApprovalRow key={c.id} courseId={c.id} title={c.title} slug={c.slug} />;
          })}
          {realCourses.data && realCourses.data.rows.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum curso ativo no banco.</p>
          )}
        </div>
      </section>
    </StudentShell>
  );
}

function CourseApprovalRow({ courseId, title, slug }: { courseId: string; title: string; slug: string }) {
  const listFn = useServerFn(listMyAttempts);
  const certFn = useServerFn(getMyCertificate);
  const attempts = useQuery({ queryKey: ["my-attempts", courseId], queryFn: () => listFn({ data: { courseId } }) });
  const cert = useQuery({ queryKey: ["my-cert", courseId], queryFn: () => certFn({ data: { courseId } }) });
  const rows = (attempts.data ?? []) as Array<{ passed: boolean }>;
  const passed = rows.some((r) => r.passed);
  const certData = cert.data as { code: string } | null;
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{rows.length} tentativa(s)</p>
      </div>
      <div className="flex items-center gap-2">
        {passed && <Badge variant="secondary" className="gap-1"><Award className="h-3 w-3" />Aprovado</Badge>}
        {certData ? (
          <Link className="text-xs text-primary underline" to="/certificado/$code" params={{ code: certData.code }}>Certificado</Link>
        ) : (
          <Link className="text-xs text-muted-foreground underline" to="/curso/$slug/prova" params={{ slug }}>Fazer prova</Link>
        )}
      </div>
    </div>
  );
}
