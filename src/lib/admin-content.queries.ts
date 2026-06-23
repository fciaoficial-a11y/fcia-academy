import { queryOptions } from "@tanstack/react-query";
import { getSupabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { ADMIN_RESOURCES, CERTIFICATES, ADMIN_USERS } from "@/lib/mock-data";

export type Row = Record<string, unknown>;
export type Source = "real" | "fallback" | "rls-empty" | "unconfigured";

export interface AdminListResult {
  rows: Row[];
  count: number;
  source: Source;
  table: string;
  notice?: string;
}

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205", "PGRST106", "PGRST301"]);

function isMissingTable(code?: string): boolean {
  return Boolean(code && MISSING_TABLE_CODES.has(code));
}

async function fetchOrFallback(
  table: string,
  fallback: Row[],
  opts: { select?: string; limit?: number } = {},
): Promise<AdminListResult> {
  if (!isSupabaseConfigured) {
    return { rows: fallback, count: fallback.length, source: "unconfigured", table, notice: "Supabase não configurado — exibindo dados de exemplo." };
  }
  try {
    const sb = getSupabase();
    const { data, count, error } = await sb
      .from(table)
      .select(opts.select ?? "*", { count: "exact" })
      .limit(opts.limit ?? 100);
    if (error) {
      if (isMissingTable((error as { code?: string }).code)) {
        return { rows: fallback, count: fallback.length, source: "fallback", table, notice: `Tabela "${table}" ainda não existe no banco — exibindo fallback.` };
      }
      throw new Error(error.message);
    }
    const rows = ((data ?? []) as unknown) as Row[];
    if (rows.length === 0) {
      return { rows: [], count: count ?? 0, source: "rls-empty", table, notice: "Sem registros visíveis. Pode ser RLS restringindo o acesso." };
    }
    return { rows, count: count ?? rows.length, source: "real", table };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { rows: fallback, count: fallback.length, source: "fallback", table, notice: `Falha ao ler "${table}": ${msg}` };
  }
}

export const adminTracksQuery = () =>
  queryOptions({
    queryKey: ["admin", "tracks"],
    queryFn: () => fetchOrFallback("tracks", ADMIN_RESOURCES.trilhas as Row[]),
  });

export const adminCoursesQuery = (trackRef?: string) =>
  queryOptions({
    queryKey: ["admin", "courses", trackRef ?? "all"],
    queryFn: async () => {
      const base = await fetchOrFallback("courses", ADMIN_RESOURCES.cursos as Row[]);
      if (!trackRef || trackRef === "all" || base.source !== "real") return base;
      const filtered = base.rows.filter((r) => {
        const v = r["track_id"] ?? r["track_slug"] ?? r["trackId"] ?? r["track"];
        return v != null && String(v) === trackRef;
      });
      return { ...base, rows: filtered, count: filtered.length };
    },
  });

export const adminModulesQuery = (courseRef?: string) =>
  queryOptions({
    queryKey: ["admin", "modules", courseRef ?? "all"],
    queryFn: async () => {
      const base = await fetchOrFallback("modules", ADMIN_RESOURCES.modulos as Row[]);
      if (!courseRef || courseRef === "all" || base.source !== "real") return base;
      const filtered = base.rows.filter((r) => {
        const v = r["course_id"] ?? r["course_slug"] ?? r["courseId"] ?? r["course"];
        return v != null && String(v) === courseRef;
      });
      return { ...base, rows: filtered, count: filtered.length };
    },
  });

export const adminQuestionsQuery = (moduleRef?: string) =>
  queryOptions({
    queryKey: ["admin", "questions", moduleRef ?? "all"],
    queryFn: async () => {
      const base = await fetchOrFallback("questions", ADMIN_RESOURCES.questoes as Row[]);
      if (!moduleRef || moduleRef === "all" || base.source !== "real") return base;
      const filtered = base.rows.filter((r) => {
        const v = r["module_id"] ?? r["module_slug"] ?? r["moduleId"] ?? r["module"];
        return v != null && String(v) === moduleRef;
      });
      return { ...base, rows: filtered, count: filtered.length };
    },
  });

export const adminCertificatesQuery = () =>
  queryOptions({
    queryKey: ["admin", "certificates"],
    queryFn: () => fetchOrFallback("certificates", CERTIFICATES as unknown as Row[]),
  });

export const adminProfilesQuery = () =>
  queryOptions({
    queryKey: ["admin", "profiles"],
    queryFn: () => fetchOrFallback("profiles", ADMIN_USERS as unknown as Row[]),
  });

export function sourceBadge(source: Source): { label: string; tone: "real" | "fallback" | "warn" } {
  if (source === "real") return { label: "Tabela real", tone: "real" };
  if (source === "rls-empty") return { label: "RLS sem registros", tone: "warn" };
  if (source === "unconfigured") return { label: "Sem Supabase", tone: "warn" };
  return { label: "Fallback mock", tone: "fallback" };
}