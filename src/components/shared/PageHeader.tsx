import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "./Breadcrumb";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  crumbs?: Crumb[];
}

export function PageHeader({ eyebrow, title, description, actions, crumbs }: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border/60 pb-6 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0 space-y-2">
        {crumbs && <Breadcrumb items={crumbs} />}
        {eyebrow && <span className="eyebrow text-primary">{eyebrow}</span>}
        <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
