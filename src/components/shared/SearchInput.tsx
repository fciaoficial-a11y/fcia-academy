import { Search } from "lucide-react";

export function SearchInput({ placeholder = "Buscar…" }: { placeholder?: string }) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-border bg-card/60 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}
