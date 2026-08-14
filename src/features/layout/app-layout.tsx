import type { ReactNode } from "react";
import { AppSidebar } from "@/features/navigation/side-bar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-800 flex-row flex-1">
      <AppSidebar />

      <main className="min-h-screen flex-row flex-1">{children}</main>
    </div>
  );
}

//What is the use of this file ??? !!! /! 