import type { ReactNode } from "react";
import { AppLayout } from "@/features/layout/app-layout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
