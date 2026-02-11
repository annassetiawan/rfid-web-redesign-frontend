import Link from "next/link";

import { navGroups } from "@/lib/mock";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  collapsed: boolean;
};

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r bg-card/95 md:flex",
        collapsed ? "w-[88px]" : "w-[278px]"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
          RF
        </div>
        {!collapsed && (
          <div className="ml-3">
            <p className="text-sm font-semibold">RFID Admin</p>
            <p className="text-xs text-muted-foreground">Operations Console</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <section key={group.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
