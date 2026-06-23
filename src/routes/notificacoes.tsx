import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — FCIA Academy" }, { name: "description", content: "Suas notificações recentes." }] }),
  component: NotifsPage,
});

function NotifsPage() {
  return (
    <StudentShell>
      <PageHeader eyebrow="Inbox" title="Notificações" description={`${NOTIFICATIONS.filter(n => !n.read).length} não lidas`} actions={<button className="rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground">Marcar tudo como lido</button>} />
      <ul className="space-y-2">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id} className={cn(
            "flex items-start gap-3 rounded-2xl border border-border/60 p-4 backdrop-blur-xl",
            n.read ? "bg-card/40" : "bg-card/60",
          )}>
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-muted" : "bg-primary")} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{n.at}</span>
          </li>
        ))}
      </ul>
    </StudentShell>
  );
}
