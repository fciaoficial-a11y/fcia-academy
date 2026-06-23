import type { Achievement } from "@/lib/mock-data";
import { AchievementCard } from "@/components/cards/AchievementCard";

interface AchievementGridProps {
  achievements: Achievement[];
  title?: string;
}

export function AchievementGrid({ achievements, title = "Conquistas" }: AchievementGridProps) {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return (
    <section className="space-y-3">
      <header className="flex items-end justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {unlocked}/{achievements.length} desbloqueadas
        </span>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <AchievementCard key={a.id} a={a} />
        ))}
      </div>
    </section>
  );
}