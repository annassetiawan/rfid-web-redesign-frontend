"use client";

import { useState } from "react";

import { DashboardContentContainer } from "@/components/dashboard/content-container";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar collapsed={collapsed} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardTopbar onToggleSidebar={() => setCollapsed((previous) => !previous)} />
        <DashboardContentContainer>{children}</DashboardContentContainer>
      </div>
    </div>
  );
}
