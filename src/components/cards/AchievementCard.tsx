import type { Achievement } from "@/lib/mock-data";
import { Lock } from "lucide-react";

export function AchievementCard({ a }: { a: Achievement }) {
  const Icon = a.icon;
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/60 p-4 backdrop-blur-xl ${a.unlocked ? "bg-card/60" : "bg-card/30"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${a.unlocked ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
          {a.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-foreground">{a.title}</h4>
          <p className="text-xs text-muted-foreground">{a.description}</p>
          <span className="mt-1 inline-block text-[10px] font-semibold text-primary">+{a.xp} XP</span>
        </div>
      </div>
    </div>
  );
}
