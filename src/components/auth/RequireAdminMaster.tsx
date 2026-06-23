import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { isAdminMasterEmail } from "@/lib/admin-master";

export function RequireAdminMaster({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const navigate = useNavigate();
  const allowed = isAdminMasterEmail(user?.email);

  useEffect(() => {
    if (!configured) {
      navigate({ to: "/system/setup" });
      return;
    }
    if (!loading && !user) navigate({ to: "/login" });
    if (!loading && user && !allowed) navigate({ to: "/dashboard" });
  }, [loading, user, allowed, configured, navigate]);

  if (!configured || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Verificando acesso…
      </div>
    );
  }
  if (!user || !allowed) return null;
  return <>{children}</>;
}