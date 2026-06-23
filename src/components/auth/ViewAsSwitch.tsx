import { useNavigate } from "@tanstack/react-router";
import { Shield, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useViewAs } from "@/lib/admin-master";

export function ViewAsSwitch({ className }: { className?: string }) {
  const { viewAs, setViewAs, isAdminMaster } = useViewAs();
  const navigate = useNavigate();
  if (!isAdminMaster) return null;

  const set = (v: "admin" | "aluno") => {
    setViewAs(v);
    navigate({ to: v === "admin" ? "/admin" : "/dashboard" });
  };

  return (
    <div
      role="tablist"
      aria-label="Modo de visualização"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-card/60 p-1 ring-1 ring-inset ring-border",
        className,
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={viewAs === "admin"}
        onClick={() => set("admin")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
          viewAs === "admin"
            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Shield className="h-3 w-3" /> Admin
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={viewAs === "aluno"}
        onClick={() => set("aluno")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
          viewAs === "aluno"
            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <GraduationCap className="h-3 w-3" /> Aluno
      </button>
    </div>
  );
}