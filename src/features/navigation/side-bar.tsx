"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  Command,
  Goal,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Activities", href: "/activities", icon: Activity },
  { label: "Goals", href: "/dashboard/goals", icon: Goal },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Admin", href: "/admin", icon: Shield },
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
          fixed left-4 top-4 bottom-4 z-40
          flex w-16 flex-col items-center
          gap-2 
          bg-tranparent p-2
        "
      >
        {/* Navigation — only icons are visible; hovering an icon
            reveals its label beside it. */}
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
                      ? " text-white"
                      : "text-neutral-700 hover:bg-white/[0.06] hover:text-white",
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

      {/* Account — floats independently at the top right, on its own
          invisible layer: no visible chrome until hovered, so it
          reads as sitting above the page rather than inside the rail. */}
      <div className="fixed right-4 top-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="
                  flex size-10 items-center justify-center
                  rounded-full border border-transparent
                  bg-neutral-900 text-sm font-medium text-white
                  transition-colors
                  hover:border-white/[0.08] hover:bg-neutral-800/80
                "
              >
                A
              </button>
            }
          ></DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={10}
            className="
              w-52 rounded-xl border-white/[0.08] bg-neutral-900 p-1.5
            "
          >
            <div className="px-2.5 py-2">
              <p className="text-sm font-medium text-white">Aayush</p>
              <p className="text-xs text-neutral-500">Personal account</p>
            </div>

            <DropdownMenuSeparator className="bg-white/[0.06]" />

            <DropdownMenuItem
              render={
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              }
            ></DropdownMenuItem>

            <DropdownMenuItem
              className="
                cursor-pointer text-neutral-400
                focus:text-white
              "
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
