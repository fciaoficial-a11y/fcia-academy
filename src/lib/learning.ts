import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  hours_load: number | null;
  order_index: number;
  track_id: string | null;
}

export interface ModuleRow {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  order_index: number;
  course_id: string;
}

export interface EnrollmentWithCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  course: CourseRow;
  totalModules: number;
  completedModules: number;
  progress: number; // 0-100
}

export const coursesKey = ["learning", "courses"] as const;
export const courseKey = (slug: string) => ["learning", "course", slug] as const;
export const enrollmentsKey = (userId: string) => ["learning", "enrollments", userId] as const;
export const progressKey = (userId: string, courseId: string) =>
  ["learning", "progress", userId, courseId] as const;

export const coursesQO = () =>
  queryOptions({
    queryKey: coursesKey,
    queryFn: async (): Promise<CourseRow[]> => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, description, hours_load, order_index, track_id")
        .order("order_index", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000,
  });

export const courseBySlugQO = (slug: string) =>
  queryOptions({
    queryKey: courseKey(slug),
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("id, slug, title, description, hours_load, order_index, track_id")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!course) return null;
      const { data: modules, error: mErr } = await supabase
        .from("modules")
        .select("id, slug, title, content, order_index, course_id")
        .eq("course_id", course.id)
        .order("order_index", { ascending: true });
      if (mErr) throw new Error(mErr.message);
      return { course: course as CourseRow, modules: (modules ?? []) as ModuleRow[] };
    },
    staleTime: 60_000,
  });

export const myEnrollmentsQO = (userId: string | undefined) =>
  queryOptions({
    queryKey: enrollmentsKey(userId ?? "anon"),
    enabled: !!userId,
    queryFn: async (): Promise<EnrollmentWithCourse[]> => {
      if (!userId) return [];
      const { data: enrolls, error } = await supabase
        .from("enrollments")
        .select("id, course_id, enrolled_at, course:courses(id, slug, title, description, hours_load, order_index, track_id)")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });
      if (error) throw new Error(error.message);
      const rows = (enrolls ?? []).filter((e: any) => e.course) as any[];
      if (rows.length === 0) return [];
      const courseIds = rows.map((r) => r.course_id);
      const [{ data: modCount }, { data: progress }] = await Promise.all([
        supabase.from("modules").select("id, course_id").in("course_id", courseIds),
        supabase.from("progress").select("module_id").eq("user_id", userId),
      ]);
      const modulesByCourse = new Map<string, string[]>();
      (modCount ?? []).forEach((m: any) => {
        const list = modulesByCourse.get(m.course_id) ?? [];
        list.push(m.id);
        modulesByCourse.set(m.course_id, list);
      });
      const completedSet = new Set((progress ?? []).map((p: any) => p.module_id));
      return rows.map((r) => {
        const ids = modulesByCourse.get(r.course_id) ?? [];
        const completed = ids.filter((id) => completedSet.has(id)).length;
        const total = ids.length;
        return {
          id: r.id,
          course_id: r.course_id,
          enrolled_at: r.enrolled_at,
          course: r.course as CourseRow,
          totalModules: total,
          completedModules: completed,
          progress: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
      });
    },
  });

export const courseProgressQO = (userId: string | undefined, courseId: string | undefined) =>
  queryOptions({
    queryKey: progressKey(userId ?? "anon", courseId ?? "none"),
    enabled: !!userId && !!courseId,
    queryFn: async (): Promise<Set<string>> => {
      if (!userId || !courseId) return new Set();
      const { data: mods, error: mErr } = await supabase
        .from("modules").select("id").eq("course_id", courseId);
      if (mErr) throw new Error(mErr.message);
      const ids = (mods ?? []).map((m: any) => m.id);
      if (ids.length === 0) return new Set();
      const { data, error } = await supabase
        .from("progress").select("module_id").eq("user_id", userId).in("module_id", ids);
      if (error) throw new Error(error.message);
      return new Set((data ?? []).map((p: any) => p.module_id));
    },
  });

export async function enrollInCourse(courseId: string, userId: string) {
  const { error } = await supabase
    .from("enrollments")
    .upsert({ user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id" });
  if (error) throw new Error(error.message);
}

export async function toggleModuleCompletion(
  moduleId: string,
  userId: string,
  completed: boolean,
) {
  if (completed) {
    const { error } = await supabase
      .from("progress")
      .delete()
      .eq("user_id", userId)
      .eq("module_id", moduleId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("progress")
      .upsert({ user_id: userId, module_id: moduleId }, { onConflict: "user_id,module_id" });
    if (error) throw new Error(error.message);
  }
}