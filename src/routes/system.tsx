import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/system/status", label: "Status" },
  { to: "/system/launch-status", label: "Launch" },
  { to: "/system/ops-status", label: "Ops" },
  { to: "/system/security-status", label: "Security" },
  { to: "/system/schema", label: "Schema" },
  { to: "/system/setup", label: "Setup" },
] as const;

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title: "System — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SystemLayout,
});

function SystemLayout() {
  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="System" description="Status, segurança e configuração da plataforma." />
      <nav className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-card/40 p-1">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeProps={{ className: "bg-primary/15 text-primary" }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-secondary/60" }}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors")}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4">
        <Outlet />
      </div>
    </AdminShell>
  );
}