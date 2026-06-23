import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Sparkles,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Visão", icon: LayoutDashboard },
  { to: "/", label: "Trilhas", icon: BookOpen },
  { to: "/", label: "Cursos", icon: BookOpen },
  { to: "/", label: "Certificados", icon: Award },
  { to: "/", label: "Usuários", icon: Users },
  { to: "/", label: "AI Studio", icon: Sparkles },
] as const;

/**
 * Admin sidebar — Sprint 1 placeholder. Rotas reais serão conectadas no Sprint 2.
 * Desktop: sticky 240px. Mobile: deve ser embrulhado num Drawer pelo consumidor.
 */
export function AdminSidebar({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-xl md:block",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-1 p-4">
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Shield className="h-3.5 w-3.5" /> Admin
        </div>
        <nav className="flex flex-col gap-1">
          {ITEMS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={label}
                to={to}
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
      </div>
    </aside>
  );
}