import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardTopbarProps = {
  collapsed: boolean;
  onToggleSidebar: () => void;
};

export function DashboardTopbar({
  collapsed,
  onToggleSidebar
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <Button onClick={onToggleSidebar} size="icon" variant="ghost">
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="text-sm font-medium md:text-base">RFID Dashboard</h1>
      </div>
      <span className="text-xs text-muted-foreground">Frontend baseline</span>
    </header>
  );
}
