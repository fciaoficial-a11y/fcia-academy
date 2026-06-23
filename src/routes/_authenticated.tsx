import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSupabase, isSupabaseConfigured } from "@/integrations/supabase/legacy";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (!isSupabaseConfigured) {
      throw redirect({ to: "/login" });
    }
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    const user = data.session?.user ?? null;
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
    return { userId: user.id };
  },
  component: () => <Outlet />,
});