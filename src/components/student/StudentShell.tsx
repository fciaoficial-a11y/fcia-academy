import type { ReactNode } from "react";
import { StudentSidebar } from "./StudentSidebar";
import { StudentTopbar } from "./StudentTopbar";
import { MobileNav } from "./MobileNav";

export function StudentShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      <StudentSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudentTopbar />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
