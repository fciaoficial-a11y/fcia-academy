export interface FilterChipsProps {
  label?: string;
  options: readonly string[];
  active?: string;
  onChange?: (option: string) => void;
}
export function FilterChips({ label, options, active, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="text-xs text-muted-foreground mr-1">{label}</span>}
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <button
            key={opt}
            type="button"
            onClick={onChange ? () => onChange(opt) : undefined}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-secondary text-foreground ring-1 ring-inset ring-primary/30"
                : "bg-card/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
