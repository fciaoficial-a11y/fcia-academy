import { createFileRoute } from "@tanstack/react-router";
import { Award, BookOpen, Calendar, Map, Trophy, Zap, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { ACHIEVEMENT_CATEGORIES, CATEGORIZED_ACHIEVEMENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { achievementsQuery, userAchievementsQuery, normalize } from "@/lib/supabase-queries";
import { DataState, RealDataSection } from "@/components/data/DataState";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/conquistas")({
  head: () => ({
    meta: [
      { title: "Conquistas — FCIA Academy" },
      { name: "description", content: "Sua coleção de badges, marcos e desafios sazonais." },
    ],
  }),
  component: AchievementsHub,
});

const CATEGORY_ICON = {
  cursos: BookOpen,
  trilhas: Map,
  xp: Zap,
  certificacoes: Award,
  eventos: Calendar,
} as const;

const RARITY_STYLE = {
  comum: "bg-secondary text-foreground",
  raro: "bg-primary/20 text-primary",
  "épico": "bg-accent/20 text-accent",
  "lendário": "bg-gradient-to-r from-primary to-accent text-primary-foreground",
} as const;

function AchievementsHub() {
  const totalUnlocked = CATEGORIZED_ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const { user } = useAuth();
  const ach = useQuery(achievementsQuery());
  const userAch = useQuery(userAchievementsQuery(user?.id));
  const unlockedIds = new Set(
    (userAch.data?.rows ?? []).map((r) => String(r.achievement_id ?? r.achievementId ?? r.id ?? "")),
  );

  return (
    <StudentShell>
      <PageHeader
        eyebrow="Coleção"
        title="Central de conquistas"
        description="Acompanhe sua trajetória através de marcos, badges e desafios especiais."
      />

      <RealDataSection title="Achievements (Supabase)" source="achievements + user_achievements">
        <DataState
          loading={ach.isLoading}
          error={(ach.error as Error) ?? null}
          data={ach.data?.rows}
          configured={ach.data?.configured ?? true}
          emptyTitle="Nenhuma conquista cadastrada"
          emptyHint="Tabela achievements está acessível mas vazia."
        >
          {(rows) => (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row, i) => {
                const n = normalize(row, `ach-${i}`);
                const unlocked = unlockedIds.has(n.id);
                return (
                  <article
                    key={n.id}
                    className={cn(
                      "rounded-2xl border border-border/60 p-4 backdrop-blur-xl",
                      unlocked ? "bg-card/60" : "bg-card/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                          unlocked
                            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {unlocked ? <Trophy className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-foreground">{n.title}</h4>
                        {n.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DataState>
      </RealDataSection>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Trophy} label="Desbloqueadas" value={`${totalUnlocked}/${CATEGORIZED_ACHIEVEMENTS.length}`} />
        <Stat icon={Zap} label="XP acumulado" value="4.820" />
        <Stat icon={Award} label="Certificações" value="3" />
        <Stat icon={Calendar} label="Eventos ativos" value="2" />
      </section>

      {ACHIEVEMENT_CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICON[cat.slug];
        const items = CATEGORIZED_ACHIEVEMENTS.filter((a) => a.category === cat.slug);
        const unlocked = items.filter((a) => a.unlocked).length;
        return (
          <section key={cat.slug} className="space-y-4">
            <header className="flex items-end justify-between gap-3">
              <div>
                <span className="eyebrow inline-flex items-center gap-2 text-primary">
                  <Icon className="h-3.5 w-3.5" /> {cat.name}
                </span>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">{cat.description}</h2>
              </div>
              <span className="text-xs text-muted-foreground">{unlocked}/{items.length} desbloqueadas</span>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <article
                  key={a.id}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-border/60 p-4 backdrop-blur-xl",
                    a.unlocked ? "bg-card/60" : "bg-card/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                      a.unlocked
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}>
                      {a.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-foreground">{a.title}</h4>
                        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider", RARITY_STYLE[a.rarity])}>
                          {a.rarity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                      {a.xp > 0 && (
                        <span className="mt-2 inline-block text-[10px] font-semibold text-primary">+{a.xp} XP</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </StudentShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}