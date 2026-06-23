import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Users, DollarSign, Award, BookOpen, Activity, Target } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { AdminMetricCard } from "@/components/cards/AdminMetricCard";
import { EXEC_DASHBOARD, ADMIN_RESOURCES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FCIA Academy" }, { name: "description", content: "Painel administrativo." }] }),
  component: AdminHomeGated,
});

function AdminHomeGated() {
  return (
    <RequireAuth>
      <AdminHome />
    </RequireAuth>
  );
}

const ICONS = [Users, DollarSign, Award, BookOpen, Activity, Target];

function AdminHome() {
  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Dashboard executivo" description="Visão consolidada de alunos, vendas, certificação e operação." />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {EXEC_DASHBOARD.kpis.map((k, i) => (
          <AdminMetricCard
            key={k.label}
            label={k.label}
            value={k.value}
            hint={k.delta}
            trend={k.trend}
            icon={ICONS[i]}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Top cursos */}
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <header className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-foreground">Top cursos por engajamento</h3>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Últimos 30 dias</span>
          </header>
          <ul className="mt-4 space-y-3">
            {EXEC_DASHBOARD.topCourses.map((c) => (
              <li key={c.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${c.completion}%` }} />
                  </div>
                </div>
                <span className="shrink-0 text-right text-xs">
                  <span className="block font-mono text-foreground">{c.students.toLocaleString("pt-BR")}</span>
                  <span className="text-[10px] text-muted-foreground">{c.completion}% concluído</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Studio activity */}
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-foreground">Atividade do AI Studio</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>3 cursos gerados (rascunho) hoje</li>
            <li>12 questões revisadas pelo time</li>
            <li>7 módulos publicados esta semana</li>
          </ul>

          <h4 className="mt-6 font-display text-sm font-semibold text-foreground">Trilhas recentes</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {ADMIN_RESOURCES.trilhas.slice(0, 4).map((t) => (
              <li key={t.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                <span className="min-w-0 truncate text-foreground">{t.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{t.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AdminShell>
  );
}
