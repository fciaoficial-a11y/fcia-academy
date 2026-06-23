import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/system/")({
  beforeLoad: () => {
    throw redirect({ to: "/system/status" });
  },
});