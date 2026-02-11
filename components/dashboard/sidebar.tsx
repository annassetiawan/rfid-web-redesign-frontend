import Link from "next/link";

import { Button } from "@/components/ui/button";
import { navGroups } from "@/lib/mock";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  collapsed: boolean;
};

type SidebarNavItemProps = {
  item: NavItem;
  collapsed: boolean;
};

function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Button
      asChild
      className={cn(
        "h-10 w-full rounded-lg text-sm text-muted-foreground",
        collapsed ? "justify-center gap-0 px-0" : "justify-start gap-2 px-3"
      )}
      variant="ghost"
    >
      <Link href={item.href}>
        <span className="grid h-9 w-9 shrink-0 place-items-center">
          <Icon className="h-5 w-5" />
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </Button>
  );
}

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r bg-card/95 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b", collapsed ? "justify-center px-2" : "px-4")}>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">
          RF
        </div>
        {!collapsed && (
          <div className="ml-3">
            <p className="text-sm font-semibold">RFID Admin</p>
            <p className="text-xs text-muted-foreground">Operations Console</p>
          </div>
        )}
      </div>

      <nav className={cn("flex flex-1 flex-col overflow-y-auto p-2", collapsed ? "gap-3" : "gap-4")}>
        {navGroups.map((group) => (
          <section key={group.title} className="flex flex-col gap-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <SidebarNavItem key={item.label} collapsed={collapsed} item={item} />
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
