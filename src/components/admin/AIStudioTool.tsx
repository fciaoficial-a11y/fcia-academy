import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Wand2, RotateCcw, Copy } from "lucide-react";
import type { AIStudioTool as Tool } from "@/lib/mock-data";

interface AIStudioToolProps {
  tool: Tool;
}

const MOCK_OUTPUT: Record<Tool["slug"], string[]> = {
  quiz: [
    "1. Qual hook usar para estado local? (a) useEffect (b) useState ✓",
    "2. useEffect roda em que momento? (a) Após renderizar ✓",
    "3. Custom hooks devem começar com… use ✓",
  ],
  resumo: [
    "• React é uma biblioteca declarativa para construir UI por componentes.",
    "• Estado é gerenciado por hooks — useState é o ponto de partida.",
    "• Efeitos colaterais (rede, DOM) vivem em useEffect com dependências.",
  ],
  objetivos: [
    "Compreender o ciclo de vida de componentes funcionais.",
    "Aplicar useState e useEffect em cenários reais.",
    "Diferenciar estado local, derivado e remoto.",
  ],
  exercicios: [
    "Exercício 1 — Construa um contador com reset e limite máximo.",
    "Exercício 2 — Crie um hook useFetch com cancelamento.",
    "Exercício 3 — Refatore um componente para extrair estado derivado.",
  ],
  curso: [
    "Módulo 1 — Fundamentos",
    "Módulo 2 — Estado e Hooks",
    "Módulo 3 — Composição e Padrões",
    "Módulo 4 — Performance",
    "Módulo 5 — Projeto Final",
  ],
  copy: [
    "Headline: Aprenda React do zero ao avançado, no seu ritmo.",
    "Sub: Trilhas guiadas, certificados validáveis e mentoria humana.",
    "CTA: Comece grátis hoje",
  ],
  certificado: [
    "Certificamos que [Aluno] concluiu o curso [Curso] com [carga].",
    "Código de validação: FCIA-XXXX-XXXX",
    "Selo dourado · Layout premium",
  ],
};

export function AIStudioTool({ tool }: AIStudioToolProps) {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const output = MOCK_OUTPUT[tool.slug];

  const run = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 800);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <form
        className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl glow-accent"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <header className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">{tool.title}</h3>
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          </div>
        </header>

        {tool.inputs.map((input, i) => (
          <label key={i} className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground">{input.label}</span>
            {input.type === "textarea" ? (
              <textarea
                rows={5}
                placeholder={input.placeholder}
                className="w-full rounded-xl border border-input bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40"
              />
            ) : input.type === "select" ? (
              <select className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground">
                {input.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={input.placeholder}
                className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40"
              />
            )}
          </label>
        ))}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow disabled:opacity-60"
          >
            <Wand2 className="h-4 w-4" /> {loading ? "Gerando…" : "Gerar rascunho"}
          </button>
          <button
            type="button"
            onClick={() => setGenerated(false)}
            className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm font-medium text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Limpar
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Dica: respostas geradas entram como rascunho em <Link to="/admin" className="text-primary underline-offset-2 hover:underline">Admin</Link> para revisão.
        </p>
      </form>

      <aside className="space-y-3 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl">
        <header className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">{tool.outputLabel}</h3>
          {generated && (
            <button type="button" className="inline-flex items-center gap-1 text-xs text-primary">
              <Copy className="h-3.5 w-3.5" /> Copiar
            </button>
          )}
        </header>
        {!generated ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-6 text-center text-xs text-muted-foreground">
            Preencha o briefing e clique em <strong>Gerar rascunho</strong> para visualizar uma prévia.
          </p>
        ) : (
          <ul className="space-y-2">
            {output.map((line, i) => (
              <li key={i} className="rounded-xl border border-border/40 bg-background/40 p-3 text-sm text-foreground">
                {line}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  );
}