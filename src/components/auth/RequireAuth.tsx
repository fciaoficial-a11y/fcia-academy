import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!configured) {
      navigate({ to: "/system/setup" });
      return;
    }
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, configured, navigate]);

  if (!configured) return null;
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Verificando sessão…
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}