import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { AuthInput } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [{ title: "Contato — FCIA Academy" }, { name: "description", content: "Fale com a equipe FCIA Academy." }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Contato" title="Fale com a gente" description="Respondemos em até 1 dia útil." />
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <form className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
            <AuthInput label="Nome" placeholder="Seu nome" />
            <AuthInput label="E-mail" type="email" placeholder="voce@email.com" />
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-foreground">Mensagem</span>
              <textarea rows={5} className="w-full rounded-xl border border-input bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40" placeholder="Como podemos ajudar?" />
            </label>
            <button className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow">Enviar mensagem</button>
          </form>
          <ul className="space-y-3">
            {[
              { icon: Mail, label: "E-mail", value: "contato@fcia.io" },
              { icon: MessageCircle, label: "WhatsApp", value: "+55 11 99999-0000" },
              { icon: MapPin, label: "Sede", value: "São Paulo · SP" },
            ].map((it) => (
              <li key={it.label} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><it.icon className="h-4 w-4" /></span>
                <div><p className="text-xs text-muted-foreground">{it.label}</p><p className="text-sm font-medium text-foreground">{it.value}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
