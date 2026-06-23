import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Admin master allowlist — frontend gate (sem user_roles no DB nesta fase).
export const ADMIN_MASTER_EMAILS = ["blindadoemotivado@gmail.com"] as const;

export function isAdminMasterEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_MASTER_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_MASTER_EMAILS)[number]);
}

export type ViewAs = "admin" | "aluno";
const KEY = "fcia:view-as";

function read(): ViewAs {
  if (typeof window === "undefined") return "admin";
  const v = window.localStorage.getItem(KEY);
  return v === "aluno" ? "aluno" : "admin";
}

export function useViewAs(): {
  viewAs: ViewAs;
  setViewAs: (v: ViewAs) => void;
  isAdminMaster: boolean;
  email: string | null;
} {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const isAdminMaster = isAdminMasterEmail(email);
  const [viewAs, setState] = useState<ViewAs>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setViewAs = (v: ViewAs) => {
    window.localStorage.setItem(KEY, v);
    setState(v);
  };

  return { viewAs, setViewAs, isAdminMaster, email };
}