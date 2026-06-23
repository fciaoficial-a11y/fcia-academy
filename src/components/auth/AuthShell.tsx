import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle?: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] hero-radial opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] tech-grid opacity-40" />
      <div className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border border-border/60 bg-card/60 p-8 backdrop-blur-xl glow-accent">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] tracking-[0.18em] font-semibold text-muted-foreground">FCIA</span>
            <span className="font-display text-base font-semibold tracking-tight text-foreground">Academy</span>
          </span>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthInput({
  label, type = "text", placeholder, value, onChange,
}: {
  label: string; type?: string; placeholder?: string;
  value?: string; onChange?: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}

export function AuthSubmit({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {children}
    </button>
  );
}
