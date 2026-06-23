import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/cards/StatCard";
import { AchievementCard } from "@/components/cards/AchievementCard";
import { AuthInput } from "@/components/auth/AuthShell";
import { STUDENT_PROFILE, STUDENT_STATS, ACHIEVEMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — FCIA Academy" }, { name: "description", content: "Gerencie seus dados e preferências." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <StudentShell>
      <PageHeader eyebrow="Conta" title="Meu perfil" description="Dados visíveis para a equipe FCIA Academy." />

      <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl sm:flex">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground">MS</div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold text-foreground">{STUDENT_PROFILE.name}</h2>
          <p className="text-sm text-muted-foreground">{STUDENT_PROFILE.email} · {STUDENT_PROFILE.role}</p>
          <p className="mt-1 text-xs text-muted-foreground">Nível {STUDENT_PROFILE.level} · {STUDENT_PROFILE.xp.toLocaleString("pt-BR")} XP</p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STUDENT_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <form className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-foreground">Dados pessoais</h3>
          <AuthInput label="Nome" placeholder={STUDENT_PROFILE.name} />
          <AuthInput label="E-mail" type="email" placeholder={STUDENT_PROFILE.email} />
          <button className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow">Salvar</button>
        </form>
        <div className="space-y-3 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-foreground">Conquistas</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.slice(0, 4).map((a) => <AchievementCard key={a.id} a={a} />)}
          </div>
        </div>
      </section>
    </StudentShell>
  );
}
