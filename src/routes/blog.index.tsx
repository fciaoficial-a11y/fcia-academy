import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BLOG_POSTS, BLOG_CATEGORIES, BLOG_AUTHORS } from "@/lib/mock-data";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

function BlogIndex() {
  const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
  const rest = BLOG_POSTS.filter((p) => p.slug !== featured.slug);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Blog" title="Conteúdo que acelera sua jornada" description="Tutoriais, ensaios e estudos de caso publicados pelo time FCIA." />

        {/* Busca */}
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar artigos por título, autor ou tema…"
            className="h-11 w-full rounded-full border border-input bg-card/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        {/* Featured */}
        <Link to="/blog/$slug" params={{ slug: featured.slug }} className="group relative grid overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card/80 via-card/60 to-background p-8 backdrop-blur-xl ring-glow lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-primary">Em destaque</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">{featured.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{featured.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
              Ler artigo <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          <div className="hidden aspect-video items-center justify-center rounded-2xl border border-border/40 bg-background/40 lg:flex">
            <div className="absolute inset-0 tech-grid opacity-20" aria-hidden />
          </div>
        </Link>

        {/* Categorias + autores */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-foreground">Categorias</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {BLOG_CATEGORIES.map((c) => (
                <Link key={c.slug} to="/blog/categoria/$slug" params={{ slug: c.slug }} className="group rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl transition-colors hover:bg-secondary/40">
                  <p className="font-display text-base font-semibold text-foreground">{c.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                  <span className="mt-2 inline-block text-[11px] text-primary">{c.count} artigos →</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-foreground">Autores</h3>
            <ul className="space-y-2">
              {BLOG_AUTHORS.map((a) => (
                <li key={a.slug}>
                  <Link to="/blog/autor/$slug" params={{ slug: a.slug }} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-xl hover:bg-secondary/40">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">{a.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{a.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{a.role} · {a.posts} posts</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Lista de posts */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-foreground">Mais recentes</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => {
              const author = BLOG_AUTHORS.find((a) => a.slug === p.authorSlug);
              const cat = BLOG_CATEGORIES.find((c) => c.slug === p.category);
              return (
                <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-colors hover:bg-secondary/30">
                  <span className="eyebrow text-primary">{cat?.name}</span>
                  <h4 className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-gradient">{p.title}</h4>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-3 text-[11px] text-muted-foreground">{author?.name} · {p.readingMin} min de leitura</p>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </AppShell>
  );
}