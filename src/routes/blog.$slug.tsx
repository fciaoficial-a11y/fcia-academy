import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { BLOG_POSTS, BLOG_AUTHORS, BLOG_CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const p = BLOG_POSTS.find((x) => x.slug === params.slug);
    return {
      meta: [
        { title: p ? `${p.title} — Blog FCIA Academy` : "Artigo — FCIA Academy" },
        { name: "description", content: p?.excerpt ?? "Artigo do blog FCIA." },
        { property: "og:title", content: p?.title ?? "Blog FCIA" },
        { property: "og:description", content: p?.excerpt ?? "" },
      ],
    };
  },
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((x) => x.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  notFoundComponent: () => <AppShell><p className="text-muted-foreground">Artigo não encontrado.</p></AppShell>,
  errorComponent: ({ error }) => <AppShell><p className="text-destructive">Erro: {error.message}</p></AppShell>,
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const author = BLOG_AUTHORS.find((a) => a.slug === post.authorSlug);
  const cat = BLOG_CATEGORIES.find((c) => c.slug === post.category);
  const published = new Date(post.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <Link to="/blog" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar ao blog
        </Link>

        <header className="space-y-4">
          {cat && (
            <Link to="/blog/categoria/$slug" params={{ slug: cat.slug }} className="eyebrow text-primary hover:underline">{cat.name}</Link>
          )}
          <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 border-y border-border/40 py-4">
            {author && (
              <Link to="/blog/autor/$slug" params={{ slug: author.slug }} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">{author.initials}</span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{author.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{author.role}</span>
                </span>
              </Link>
            )}
            <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {published}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingMin} min</span>
              <button className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-foreground">
                <Share2 className="h-3 w-3" /> Compartilhar
              </button>
            </span>
          </div>
        </header>

        {/* Conteúdo placeholder */}
        <div className="prose-fcia space-y-4 text-base leading-relaxed text-foreground">
          <p className="text-muted-foreground">Conteúdo do artigo em construção. Esta página demonstra a estrutura visual e a tipografia editorial usadas pelo blog FCIA.</p>
          <p>Cada parágrafo é renderizado com espaçamento generoso e hierarquia tipográfica clara, otimizada para leitura longa em dark mode.</p>
          <h2 className="font-display text-2xl font-semibold text-foreground">Subtítulo de seção</h2>
          <p>Use componentes existentes (Cards, callouts, blocos de código) para enriquecer a leitura. A área de comentários e artigos relacionados é renderizada abaixo.</p>
          <blockquote className="rounded-2xl border-l-2 border-primary bg-card/40 p-4 text-sm italic text-muted-foreground">
            "A melhor forma de aprender é ensinar." — Time FCIA
          </blockquote>
        </div>
      </article>
    </AppShell>
  );
}