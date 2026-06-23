import { Link } from "@tanstack/react-router";
import { Bell, Flame, Zap } from "lucide-react";
import { STUDENT_PROFILE } from "@/lib/mock-data";
import { SearchInput } from "@/components/shared/SearchInput";

export function StudentTopbar() {
  return (
    <header className="sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl sm:flex sm:px-6">
      <div className="min-w-0 flex-1"><SearchInput placeholder="Buscar cursos, trilhas…" /></div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1 rounded-full bg-card/60 px-3 py-1.5 text-xs text-foreground ring-1 ring-inset ring-border md:inline-flex">
          <Flame className="h-3.5 w-3.5 text-primary" /> {STUDENT_PROFILE.streak} dias
        </span>
        <span className="hidden items-center gap-1 rounded-full bg-card/60 px-3 py-1.5 text-xs text-foreground ring-1 ring-inset ring-border md:inline-flex">
          <Zap className="h-3.5 w-3.5 text-primary" /> {STUDENT_PROFILE.xp.toLocaleString("pt-BR")} XP
        </span>
        <Link to="/notificacoes" className="grid h-9 w-9 place-items-center rounded-full bg-card/60 ring-1 ring-inset ring-border hover:bg-secondary">
          <Bell className="h-4 w-4 text-foreground" />
        </Link>
        <Link to="/perfil" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
          MS
        </Link>
      </div>
    </header>
  );
}
