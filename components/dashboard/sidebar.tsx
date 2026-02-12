"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  isExpanded: boolean;
  onToggle: (label: string) => void;
};

function SidebarNavItem({ item, collapsed, isExpanded, onToggle }: SidebarNavItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive =
    item.href !== "#" && (pathname === item.href || pathname.startsWith(`${item.href}/`));
  const hasChildren = Boolean(item.children?.length);

  return (
    <div className="flex flex-col gap-1">
      {hasChildren ? (
        <Button
          className={cn(
            "h-11 w-full rounded-none text-sm text-slate-600 hover:text-slate-700",
            collapsed ? "justify-center gap-0 px-0" : "justify-start gap-2 px-3",
            isActive && "bg-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
          )}
          variant="ghost"
          onClick={() => onToggle(item.label)}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center">
            <Icon className="h-5 w-5" />
          </span>
          {!collapsed && <span className="truncate font-medium">{item.label}</span>}
          {!collapsed && item.hasChevron && (
            <span className="ml-auto grid h-5 w-5 place-items-center">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </span>
          )}
        </Button>
      ) : (
        <Button
          asChild
          className={cn(
            "h-11 w-full rounded-none text-sm text-slate-600 hover:text-slate-700",
            collapsed ? "justify-center gap-0 px-0" : "justify-start gap-2 px-3",
            isActive && "bg-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
          )}
          variant="ghost"
        >
          <Link href={item.href}>
            <span className="grid h-9 w-9 shrink-0 place-items-center">
              <Icon className="h-5 w-5" />
            </span>
            {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            {!collapsed && item.hasChevron && (
              <span className="ml-auto grid h-5 w-5 place-items-center">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </span>
            )}
          </Link>
        </Button>
      )}

      {!collapsed && isExpanded && (
        <div className="px-3 py-1.5">
          {item.children?.map((child) => {
            const isChildActive =
              child.href !== "#" && (pathname === child.href || pathname.startsWith(`${child.href}/`));
            return (
              <Button
                key={child.label}
                asChild
                className={cn(
                  "h-10 w-full justify-start rounded-none px-9 text-sm font-medium text-slate-600 hover:bg-transparent hover:text-slate-700",
                  isChildActive && "bg-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
                )}
                variant="ghost"
              >
                <Link href={child.href}>{child.label}</Link>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.expanded) {
          initial[item.label] = true;
        }
      });
    });
    return initial;
  });

  const handleToggle = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-slate-200 bg-[#f3f4f8] md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-slate-200", collapsed ? "justify-center px-2" : "px-4")}>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-indigo-100 text-xs font-bold text-indigo-600">
          RF
        </div>
        {!collapsed && (
          <div className="ml-3">
            <p className="text-sm font-semibold text-slate-700">RFID Admin</p>
            <p className="text-xs text-slate-500">Operations Console</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto py-3">
        {navGroups.map((group, groupIndex) => (
          <section key={groupIndex} className="flex flex-col gap-1">
            {group.title && !collapsed && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {group.title}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.label}
                  collapsed={collapsed}
                  item={item}
                  isExpanded={Boolean(openGroups[item.label])}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}

