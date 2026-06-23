import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/cards/StatCard";
import { LeaderboardCard } from "@/components/cards/LeaderboardCard";
import { AchievementGrid } from "@/components/gamification/AchievementGrid";
import { XPSystem } from "@/components/gamification/XPSystem";
import { AuthInput } from "@/components/auth/AuthShell";
import {
  STUDENT_PROFILE, STUDENT_STATS, ACHIEVEMENTS, LEADERBOARD, XP_LEVELS, CERTIFICATES, COURSES,
} from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { DataState, RealDataSection } from "@/components/data/DataState";
import { RequireAuth } from "@/components/auth/RequireAuth";
import type { Row } from "@/lib/supabase-queries";
import { normalize } from "@/lib/supabase-queries";
import { queryOptions } from "@tanstack/react-query";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — FCIA Academy" }, { name: "description", content: "Gerencie seus dados e preferências." }] }),
  component: ProfilePageGated,
});

function ProfilePageGated() {
  return (<RequireAuth><ProfilePage /></RequireAuth>);
}

function ProfilePage() {
  const finished = COURSES.filter((c) => c.progress === 100).length;
  const initials = STUDENT_PROFILE.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const { user } = useAuth();
  const q = useQuery(
    queryOptions({
      queryKey: ["sb", "profiles", user?.id ?? "anon"],
      enabled: isSupabaseConfigured && !!user?.id,
      queryFn: async () => {
        const sb = getSupabase();
        const { data, error } = await sb.from("profiles").select("*").eq("id", user!.id).limit(1);
        if (error) {
          // tenta por user_id
          const alt = await sb.from("profiles").select("*").eq("user_id", user!.id).limit(1);
          if (alt.error) throw new Error(error.message);
          return (alt.data ?? []) as Row[];
        }
        return (data ?? []) as Row[];
      },
    }),
  );

  return (
    <StudentShell>
      <PageHeader eyebrow="Conta" title="Meu perfil" description="Dados visíveis para a equipe FCIA Academy." />

      <RealDataSection title="Perfil no banco" source={`profiles · ${user?.email ?? "—"}`}>
        <DataState
          loading={q.isLoading}
          error={q.error as Error | null}
          data={q.data}
          configured={isSupabaseConfigured}
          emptyTitle="Sem perfil em profiles para este usuário"
          emptyHint="Conteúdo abaixo é fallback do mock."
        >
          {(data) => {
            const n = normalize(data[0]);
            return (
              <dl className="grid gap-2 text-xs">
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">id</dt><dd className="font-mono">{n.id}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">title/name</dt><dd>{n.title}</dd></div>
                {n.description && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">bio</dt><dd className="text-right">{n.description}</dd></div>}
              </dl>
            );
          }}
        </DataState>
      </RealDataSection>


      <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl sm:flex">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground ring-glow">{initials}</div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold text-foreground">{STUDENT_PROFILE.name}</h2>
          <p className="text-sm text-muted-foreground">{STUDENT_PROFILE.email} · {STUDENT_PROFILE.role}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Nível {STUDENT_PROFILE.level} · {STUDENT_PROFILE.xp.toLocaleString("pt-BR")} XP · {finished} cursos concluídos · {CERTIFICATES.length} certificados
          </p>
          <p className="mt-2 max-w-prose text-xs text-foreground/80">
            Engenheira frontend apaixonada por design systems e experiências aceleradas por IA.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STUDENT_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <XPSystem
          level={STUDENT_PROFILE.level}
          xp={STUDENT_PROFILE.xp}
          xpToNext={STUDENT_PROFILE.xpToNext}
          streak={STUDENT_PROFILE.streak}
          rank={5}
          levels={XP_LEVELS}
        />
        <LeaderboardCard entries={LEADERBOARD} title="Ranking semanal" />
      </div>

      <AchievementGrid achievements={ACHIEVEMENTS} />

      <section className="grid gap-4 lg:grid-cols-2">
        <form className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-foreground">Dados pessoais</h3>
          <AuthInput label="Nome" placeholder={STUDENT_PROFILE.name} />
          <AuthInput label="E-mail" type="email" placeholder={STUDENT_PROFILE.email} />
          <AuthInput label="Bio" placeholder="Conte um pouco sobre você…" />
          <button className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow">Salvar</button>
        </form>
        <div className="space-y-3 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-foreground">Certificados recentes</h3>
          <ul className="space-y-2">
            {CERTIFICATES.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{c.courseTitle}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{c.code}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{c.hours}h</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </StudentShell>
  );
}
