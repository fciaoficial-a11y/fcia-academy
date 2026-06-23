import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Map, Award, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/meus-cursos", label: "Cursos", icon: BookOpen },
  { to: "/minhas-trilhas", label: "Trilhas", icon: Map },
  { to: "/certificados", label: "Certif.", icon: Award },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border/60 bg-background/90 backdrop-blur-xl lg:hidden">
      {ITEMS.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link key={to} to={to} className={cn(
            "flex flex-col items-center justify-center gap-1 py-2 text-[10px]",
            active ? "text-primary" : "text-muted-foreground",
          )}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
