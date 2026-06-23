import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { AdminCard } from "@/components/cards/AdminCard";
import { ADMIN_STATS, ADMIN_RESOURCES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FCIA Academy" }, { name: "description", content: "Painel administrativo." }] }),
  component: AdminHome,
});

function AdminHome() {
  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Visão geral" description="KPIs operacionais e status dos recursos." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_STATS.map((s) => <AdminCard key={s.label} title={s.label} value={s.value} hint={s.hint} />)}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-foreground">Trilhas recentes</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {ADMIN_RESOURCES.trilhas.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
                <span className="min-w-0 truncate text-foreground">{t.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{t.level} · {t.courses} cursos</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-foreground">Atividade do AI Studio</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>3 cursos gerados (rascunho) hoje</li>
            <li>12 questões revisadas pelo time</li>
            <li>7 módulos publicados esta semana</li>
          </ul>
        </div>
      </section>
    </AdminShell>
  );
}
