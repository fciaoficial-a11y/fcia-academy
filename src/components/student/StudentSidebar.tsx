import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, Map, Award, User, Settings, Bell, Sparkles, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meus-cursos", label: "Meus cursos", icon: BookOpen },
  { to: "/minhas-trilhas", label: "Minhas trilhas", icon: Map },
  { to: "/certificados", label: "Certificados", icon: Award },
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/notificacoes", label: "Notificações", icon: Bell },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function StudentSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border/60 bg-sidebar/80 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col p-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] tracking-[0.18em] font-semibold text-muted-foreground">FCIA</span>
            <span className="font-display text-base font-semibold tracking-tight text-foreground">Academy</span>
          </span>
        </Link>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {ITEMS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to} to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-secondary text-foreground ring-1 ring-inset ring-primary/30"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link to="/" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sair
        </Link>
      </div>
    </aside>
  );
}
