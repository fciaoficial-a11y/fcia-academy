import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BLOG_CATEGORIES, BLOG_POSTS, BLOG_AUTHORS } from "@/lib/mock-data";

export const Route = createFileRoute("/blog/categoria/$slug")({
  head: ({ params }) => {
    const c = BLOG_CATEGORIES.find((x) => x.slug === params.slug);
    return {
      meta: [
        { title: c ? `${c.name} — Blog FCIA Academy` : "Categoria — Blog" },
        { name: "description", content: c?.description ?? "Categoria do blog." },
      ],
    };
  },
  loader: ({ params }) => {
    const category = BLOG_CATEGORIES.find((x) => x.slug === params.slug);
    if (!category) throw notFound();
    return { category };
  },
  notFoundComponent: () => <AppShell><p className="text-muted-foreground">Categoria não encontrada.</p></AppShell>,
  errorComponent: ({ error }) => <AppShell><p className="text-destructive">Erro: {error.message}</p></AppShell>,
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const posts = BLOG_POSTS.filter((p) => p.category === category.slug);
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6">
        <PageHeader crumbs={[{ label: "Blog", to: "/blog" }, { label: category.name }]} eyebrow="Categoria" title={category.name} description={category.description} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const author = BLOG_AUTHORS.find((a) => a.slug === p.authorSlug);
            return (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl hover:bg-secondary/30">
                <h4 className="font-display text-base font-semibold text-foreground">{p.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="mt-3 text-[11px] text-muted-foreground">{author?.name} · {p.readingMin} min</p>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}