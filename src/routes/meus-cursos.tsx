import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseCard } from "@/components/cards/CourseCard";
import { FilterChips } from "@/components/shared/FilterChips";
import { COURSES } from "@/lib/mock-data";

export const Route = createFileRoute("/meus-cursos")({
  head: () => ({ meta: [{ title: "Meus cursos — FCIA Academy" }, { name: "description", content: "Veja seus cursos em andamento e concluídos." }] }),
  component: MyCourses,
});

function MyCourses() {
  const enrolled = COURSES.filter((c) => c.progress > 0);
  return (
    <StudentShell>
      <PageHeader eyebrow="Aprendizado" title="Meus cursos" description={`${enrolled.length} cursos ativos`} />
      <FilterChips options={["Todos", "Em andamento", "Concluídos", "Favoritos"]} active="Todos" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {enrolled.map((c) => <CourseCard key={c.slug} course={c} />)}
      </div>
    </StudentShell>
  );
}
