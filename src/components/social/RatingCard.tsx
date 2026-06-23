import { Star } from "lucide-react";

interface RatingCardProps {
  rating: number;
  totalReviews: number;
  label?: string;
}

export function RatingCard({ rating, totalReviews, label = "Avaliação média" }: RatingCardProps) {
  const stars = Math.round(rating);
  return (
    <article className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold text-foreground">{rating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">/ 5,0</span>
      </div>
      <div className="mt-1 flex items-center gap-0.5 text-primary">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < stars ? "fill-current" : "opacity-30"}`} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{totalReviews.toLocaleString("pt-BR")} avaliações</p>
    </article>
  );
}