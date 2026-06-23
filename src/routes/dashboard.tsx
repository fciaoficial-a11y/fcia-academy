import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/cards/StatCard";
import { ProgressCard } from "@/components/cards/ProgressCard";
import { AchievementCard } from "@/components/cards/AchievementCard";
import { CertificateCard } from "@/components/cards/CertificateCard";
import { STUDENT_PROFILE, STUDENT_STATS, COURSES, ACHIEVEMENTS, CERTIFICATES, ACTIVITIES, UPCOMING } from "@/lib/mock-data";
import { Play, Zap, BookOpen, Brain, Award } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FCIA Academy" }, { name: "description", content: "Acompanhe XP, progresso, conquistas e próximas aulas." }] }),
  component: Dashboard,
});

const ICONS = { aula: Play, quiz: Brain, certificado: Award, conquista: Zap } as const;

function Dashboard() {
  const inProgress = COURSES.filter((c) => c.progress > 0 && c.progress < 100);
  const xpPct = Math.round((STUDENT_PROFILE.xp / STUDENT_PROFILE.xpToNext) * 100);

  return (
    <StudentShell>
      <PageHeader eyebrow={`Olá, ${STUDENT_PROFILE.name.split(" ")[0]}`} title="Seu painel de aprendizado" description="Continue de onde parou e siga conquistando XP." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STUDENT_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl glow-primary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow text-primary">Nível {STUDENT_PROFILE.level}</span>
            <h2 className="font-display text-xl font-semibold text-foreground">{STUDENT_PROFILE.xp.toLocaleString("pt-BR")} / {STUDENT_PROFILE.xpToNext.toLocaleString("pt-BR")} XP</h2>
            <p className="text-sm text-muted-foreground">Faltam {(STUDENT_PROFILE.xpToNext - STUDENT_PROFILE.xp).toLocaleString("pt-BR")} XP para o próximo nível.</p>
          </div>
          <div className="w-full sm:w-72">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${xpPct}%` }} />
            </div>
            <span className="mt-1 block text-right text-[11px] text-muted-foreground">{xpPct}%</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Cursos em andamento</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {inProgress.map((c) => <ProgressCard key={c.slug} course={c} />)}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Próximas aulas</h2>
          <ul className="space-y-2">
            {UPCOMING.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{u.title}</p>
                  <p className="text-xs text-muted-foreground">{u.course} · {u.durationMin} min</p>
                </div>
                <button className="shrink-0 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-medium text-primary-foreground ring-glow">Assistir</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Últimas atividades</h2>
          <ul className="space-y-2">
            {ACTIVITIES.map((a) => {
              const Icon = ICONS[a.type];
              return (
                <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-foreground"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.at}</p>
                  </div>
                  {a.xp != null && <span className="shrink-0 text-xs font-semibold text-primary">+{a.xp} XP</span>}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Conquistas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.slice(0, 6).map((a) => <AchievementCard key={a.id} a={a} />)}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Certificados recentes</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATES.map((c) => <CertificateCard key={c.id} c={c} />)}
        </div>
      </section>
    </StudentShell>
  );
}
