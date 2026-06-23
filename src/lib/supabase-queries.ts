import { queryOptions } from "@tanstack/react-query";
import { getSupabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export type Row = Record<string, unknown>;

export interface ListResult<T extends Row = Row> {
  rows: T[];
  count: number;
  configured: boolean;
}

async function listTable<T extends Row>(table: string, limit = 24): Promise<ListResult<T>> {
  if (!isSupabaseConfigured) return { rows: [], count: 0, configured: false };
  const sb = getSupabase();
  const { data, count, error } = await sb
    .from(table)
    .select("*", { count: "exact" })
    .limit(limit);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as T[], count: count ?? 0, configured: true };
}

export const tracksQuery = () =>
  queryOptions({ queryKey: ["sb", "tracks"], queryFn: () => listTable("tracks") });
export const coursesQuery = () =>
  queryOptions({ queryKey: ["sb", "courses"], queryFn: () => listTable("courses") });
export const modulesQuery = (courseRef?: string) =>
  queryOptions({
    queryKey: ["sb", "modules", courseRef ?? "all"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return { rows: [], count: 0, configured: false };
      const sb = getSupabase();
      let q = sb.from("modules").select("*", { count: "exact" }).limit(50);
      if (courseRef) {
        // try common FK names
        const { data, error } = await q.or(
          `course_id.eq.${courseRef},course_slug.eq.${courseRef},courseId.eq.${courseRef}`,
        );
        if (error) {
          const all = await sb.from("modules").select("*", { count: "exact" }).limit(50);
          if (all.error) throw new Error(all.error.message);
          return { rows: (all.data ?? []) as Row[], count: all.count ?? 0, configured: true };
        }
        return { rows: (data ?? []) as Row[], count: data?.length ?? 0, configured: true };
      }
      const { data, count, error } = await q;
      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as Row[], count: count ?? 0, configured: true };
    },
  });
export const certificatesQuery = () =>
  queryOptions({ queryKey: ["sb", "certificates"], queryFn: () => listTable("certificates") });
export const profilesQuery = () =>
  queryOptions({ queryKey: ["sb", "profiles"], queryFn: () => listTable("profiles", 1) });

export const achievementsQuery = () =>
  queryOptions({ queryKey: ["sb", "achievements"], queryFn: () => listTable("achievements", 100) });

export const userAchievementsQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["sb", "user_achievements", userId ?? "anon"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return { rows: [], count: 0, configured: false };
      const sb = getSupabase();
      let q = sb.from("user_achievements").select("*", { count: "exact" }).limit(100);
      if (userId) q = q.eq("user_id", userId);
      const { data, count, error } = await q;
      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as Row[], count: count ?? 0, configured: true };
    },
  });

// ---- Normalizers: tolerant mapping for unknown column names ----

function pick(row: Row, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function pickNum(row: Row, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

export interface NormalRow {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  level?: string;
  category?: string;
  hours?: number;
  count?: number;
  rating?: number;
  image?: string;
  raw: Row;
}

export function normalize(row: Row, fallbackId = ""): NormalRow {
  return {
    id: String(pick(row, ["id", "uuid", "slug"]) ?? fallbackId),
    slug: pick(row, ["slug", "id"]),
    title: pick(row, ["title", "name", "label", "course_title", "track_title"]) ?? "Sem título",
    description: pick(row, ["description", "summary", "subtitle", "excerpt", "body"]),
    level: pick(row, ["level", "difficulty", "tier"]),
    category: pick(row, ["category", "area", "topic", "tag"]),
    hours: pickNum(row, ["hours", "duration_hours", "duration_minutes"]),
    count: pickNum(row, ["courses_count", "modules_count", "lessons_count", "items"]),
    rating: pickNum(row, ["rating", "score", "stars"]),
    image: pick(row, ["image_url", "cover_url", "thumbnail", "image", "cover"]),
    raw: row,
  };
}