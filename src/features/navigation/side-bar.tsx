"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenLine ,
  CalendarDays,
  ChartPie,
  Command,
  Goal,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Calendar 
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Today",
    href: "/today",
    icon: LayoutDashboard,
  },
  {
    label: "Overview",
    href: "/overview",
    icon: ChartPie,
  },
  {
    label: "Plan",
    href: "/plan",
    icon: PenLine ,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar  ,
  },

];

// Floating label that reveals beside each icon on hover — nothing but
// the icon is visible at rest, per the brief. Positioned to the RIGHT
// (`left-full`) rather than the left: the rail sits only 16px off the
// screen edge, so a label growing left would mostly render off-canvas.
// If you move the rail away from the edge and want it literally on
// the left, swap `left-full ml-3` for `right-full mr-3` below.
function IconLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        pointer-events-none absolute left-full top-1/2 z-50 ml-3
        -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg
        border border-white/10 bg-neutral-900 px-2.5 py-1.5 text-xs
        font-medium text-white opacity-0 shadow-2xl shadow-black/50
        transition-all duration-200 ease-out
        group-hover:translate-x-0 group-hover:opacity-100
      "
    >
      {children}
    </span>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Icon rail */}
<aside
  className="
    fixed bottom-6 left-6 top-6 z-40
    flex w-12 flex-col items-center
    bg-transparent
  "
>
  <nav className="flex flex-1 flex-col items-center justify-center gap-2">
    {navigation.map((item) => {
      const Icon = item.icon;
      const active =
        pathname === item.href || pathname.startsWith(`${item.href}/`);

      return (
        <div key={item.href} className="group relative">
          <Link
            href={item.href}
            className={cn(
              "flex size-10 items-center justify-center rounded-xl transition-colors",
              active
                ? "text-white"
                : "text-neutral-600 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.8} />
          </Link>

          <IconLabel>{item.label}</IconLabel>
        </div>
      );
    })}
  </nav>
</aside>

      
    </>
  );
}
