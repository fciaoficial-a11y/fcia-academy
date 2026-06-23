import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb { label: string; to?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {c.to && !last ? (
              <Link to={c.to} className="hover:text-foreground transition-colors">{c.label}</Link>
            ) : (
              <span className={last ? "text-foreground" : ""}>{c.label}</span>
            )}
            {!last && <ChevronRight className="h-3 w-3" />}
          </span>
        );
      })}
    </nav>
  );
}
