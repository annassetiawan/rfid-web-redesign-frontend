import Link from "next/link";
import { LayoutDashboard, RadioTower, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Readers", href: "#", icon: RadioTower },
  { label: "Settings", href: "#", icon: Settings }
];

type DashboardSidebarProps = {
  collapsed: boolean;
};

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r bg-card md:flex",
        collapsed ? "w-[84px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center px-4">
        <span className="text-sm font-semibold tracking-wide text-primary">
          {collapsed ? "RF" : "RFID Admin"}
        </span>
      </div>
      <nav className="space-y-2 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              href={item.href}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
