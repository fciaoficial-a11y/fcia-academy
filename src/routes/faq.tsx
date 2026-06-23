import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FAQS } from "@/lib/mock-data";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — FCIA Academy" }, { name: "description", content: "Perguntas frequentes sobre a FCIA Academy." }] }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Ajuda" title="Perguntas frequentes" description="Não achou o que procurava? Fale conosco." />
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <summary className="cursor-pointer list-none font-medium text-foreground">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
