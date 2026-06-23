import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — FCIA Academy" }, { name: "description", content: "Preferências, notificações e segurança." }] }),
  component: SettingsPage,
});

const SECTIONS = [
  { title: "Notificações por e-mail", options: ["Novidades", "Lembretes de estudo", "Certificados emitidos"] },
  { title: "Privacidade", options: ["Perfil público", "Mostrar XP no ranking"] },
  { title: "Segurança", options: ["Autenticação em dois fatores"] },
];

function SettingsPage() {
  return (
    <StudentShell>
      <PageHeader eyebrow="Preferências" title="Configurações" description="Ajuste como a FCIA Academy se comporta para você." />
      <div className="grid gap-4 lg:grid-cols-2">
        {SECTIONS.map((s) => (
          <section key={s.title} className="space-y-3 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
            <h3 className="font-display text-base font-semibold text-foreground">{s.title}</h3>
            <ul className="space-y-2">
              {s.options.map((o) => (
                <li key={o} className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 p-3 text-sm text-foreground">
                  {o}
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input accent-[oklch(var(--primary))]" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </StudentShell>
  );
}
