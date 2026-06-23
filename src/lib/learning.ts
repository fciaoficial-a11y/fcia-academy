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

export interface LessonRow {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  content: string | null;
  order_index: number;
}

export interface ModuleWithLessons extends ModuleRow {
  lessons: LessonRow[];
}

export interface EnrollmentWithCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  course: CourseRow;
  totalUnits: number;
  completedUnits: number;
  unitLabel: "aula" | "módulo";
  lastLessonId: string | null;
  progress: number; // 0-100
}

export const coursesKey = ["learning", "courses"] as const;
export const courseKey = (slug: string) => ["learning", "course", slug] as const;
export const enrollmentsKey = (userId: string) => ["learning", "enrollments", userId] as const;
export const progressKey = (userId: string, courseId: string) =>
  ["learning", "progress", userId, courseId] as const;
export const lessonProgressKey = (userId: string, courseId: string) =>
  ["learning", "lesson-progress", userId, courseId] as const;

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
      const moduleIds = (modules ?? []).map((m: any) => m.id);
      let lessons: LessonRow[] = [];
      if (moduleIds.length > 0) {
        const { data: lessonData, error: lErr } = await supabase
          .from("lessons")
          .select("id, module_id, slug, title, content, order_index")
          .in("module_id", moduleIds)
          .order("order_index", { ascending: true });
        if (lErr) throw new Error(lErr.message);
        lessons = (lessonData ?? []) as LessonRow[];
      }
      const lessonsByModule = new Map<string, LessonRow[]>();
      lessons.forEach((l) => {
        const list = lessonsByModule.get(l.module_id) ?? [];
        list.push(l);
        lessonsByModule.set(l.module_id, list);
      });
      const modulesWithLessons: ModuleWithLessons[] = (modules ?? []).map((m: any) => ({
        ...m,
        lessons: lessonsByModule.get(m.id) ?? [],
      }));
      return { course: course as CourseRow, modules: modulesWithLessons };
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
        .select("id, course_id, enrolled_at, last_lesson_id, course:courses(id, slug, title, description, hours_load, order_index, track_id)")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });
      if (error) throw new Error(error.message);
      const rows = (enrolls ?? []).filter((e: any) => e.course) as any[];
      if (rows.length === 0) return [];
      const courseIds = rows.map((r) => r.course_id);
      const { data: modCount } = await supabase
        .from("modules").select("id, course_id").in("course_id", courseIds);
      const modulesByCourse = new Map<string, string[]>();
      (modCount ?? []).forEach((m: any) => {
        const list = modulesByCourse.get(m.course_id) ?? [];
        list.push(m.id);
        modulesByCourse.set(m.course_id, list);
      });
      const allModuleIds = (modCount ?? []).map((m: any) => m.id);
      const [{ data: lessonRows }, { data: progress }, { data: lessonProg }] = await Promise.all([
        allModuleIds.length
          ? supabase.from("lessons").select("id, module_id").in("module_id", allModuleIds)
          : Promise.resolve({ data: [] as any[] }),
        supabase.from("progress").select("module_id").eq("user_id", userId),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId),
      ]);
      const lessonsByCourse = new Map<string, string[]>();
      const moduleOfLesson = new Map<string, string>();
      (lessonRows ?? []).forEach((l: any) => {
        moduleOfLesson.set(l.id, l.module_id);
      });
      (lessonRows ?? []).forEach((l: any) => {
        for (const [courseId, modIds] of modulesByCourse) {
          if (modIds.includes(l.module_id)) {
            const list = lessonsByCourse.get(courseId) ?? [];
            list.push(l.id);
            lessonsByCourse.set(courseId, list);
            break;
          }
        }
      });
      const completedModules = new Set((progress ?? []).map((p: any) => p.module_id));
      const completedLessons = new Set((lessonProg ?? []).map((p: any) => p.lesson_id));
      return rows.map((r) => {
        const lessonIds = lessonsByCourse.get(r.course_id) ?? [];
        if (lessonIds.length > 0) {
          const done = lessonIds.filter((id) => completedLessons.has(id)).length;
          return {
            id: r.id,
            course_id: r.course_id,
            enrolled_at: r.enrolled_at,
            course: r.course as CourseRow,
            totalUnits: lessonIds.length,
            completedUnits: done,
            unitLabel: "aula" as const,
            lastLessonId: r.last_lesson_id ?? null,
            progress: Math.round((done / lessonIds.length) * 100),
          };
        }
        const ids = modulesByCourse.get(r.course_id) ?? [];
        const done = ids.filter((id) => completedModules.has(id)).length;
        return {
          id: r.id,
          course_id: r.course_id,
          enrolled_at: r.enrolled_at,
          course: r.course as CourseRow,
          totalUnits: ids.length,
          completedUnits: done,
          unitLabel: "módulo" as const,
          lastLessonId: r.last_lesson_id ?? null,
          progress: ids.length === 0 ? 0 : Math.round((done / ids.length) * 100),
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

export const courseLessonProgressQO = (
  userId: string | undefined,
  courseId: string | undefined,
  lessonIds: string[],
) =>
  queryOptions({
    queryKey: [...lessonProgressKey(userId ?? "anon", courseId ?? "none"), lessonIds.length],
    enabled: !!userId && !!courseId && lessonIds.length > 0,
    queryFn: async (): Promise<Set<string>> => {
      if (!userId || lessonIds.length === 0) return new Set();
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds);
      if (error) throw new Error(error.message);
      return new Set((data ?? []).map((p: any) => p.lesson_id));
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

export async function toggleLessonCompletion(
  lessonId: string,
  userId: string,
  completed: boolean,
) {
  if (completed) {
    const { error } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("lesson_progress")
      .upsert({ user_id: userId, lesson_id: lessonId }, { onConflict: "user_id,lesson_id" });
    if (error) throw new Error(error.message);
  }
}

export async function setLastLesson(courseId: string, lessonId: string, userId: string) {
  const { error } = await supabase
    .from("enrollments")
    .update({ last_lesson_id: lessonId })
    .eq("user_id", userId)
    .eq("course_id", courseId);
  if (error) throw new Error(error.message);
}