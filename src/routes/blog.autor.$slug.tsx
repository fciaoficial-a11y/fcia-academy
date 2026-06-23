import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BLOG_AUTHORS, BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/blog/autor/$slug")({
  head: ({ params }) => {
    const a = BLOG_AUTHORS.find((x) => x.slug === params.slug);
    return {
      meta: [
        { title: a ? `${a.name} — Autor FCIA Academy` : "Autor — Blog" },
        { name: "description", content: a?.bio ?? "Autor do blog." },
      ],
    };
  },
  loader: ({ params }) => {
    const author = BLOG_AUTHORS.find((x) => x.slug === params.slug);
    if (!author) throw notFound();
    return { author };
  },
  notFoundComponent: () => <AppShell><p className="text-muted-foreground">Autor não encontrado.</p></AppShell>,
  errorComponent: ({ error }) => <AppShell><p className="text-destructive">Erro: {error.message}</p></AppShell>,
  component: AuthorPage,
});

function AuthorPage() {
  const { author } = Route.useLoaderData();
  const posts = BLOG_POSTS.filter((p) => p.authorSlug === author.slug);
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader crumbs={[{ label: "Blog", to: "/blog" }, { label: author.name }]} eyebrow="Autor" title={author.name} description={author.bio} />

        <header className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground ring-glow">{author.initials}</span>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-foreground">{author.name}</p>
            <p className="text-xs text-muted-foreground">{author.role} · {author.posts} artigos publicados</p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const cat = BLOG_CATEGORIES.find((c) => c.slug === p.category);
            return (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl hover:bg-secondary/30">
                <span className="eyebrow text-primary">{cat?.name}</span>
                <h4 className="mt-2 font-display text-base font-semibold text-foreground">{p.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}