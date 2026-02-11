import { Bell, ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dateRangeOptions } from "@/lib/mock";

type DashboardTopbarProps = {
  onToggleSidebar: () => void;
};

export function DashboardTopbar({ onToggleSidebar }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-2 md:px-6">
        <Button onClick={onToggleSidebar} size="icon" variant="ghost">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="relative min-w-[240px] flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search requests, labels, accessories..." />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Date range"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={dateRangeOptions[1]}
          >
            {dateRangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <Button size="icon" variant="ghost">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          <details className="relative">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border px-3 text-sm text-foreground marker:content-none">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                AD
              </span>
              <span className="hidden sm:inline">Admin User</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-44 rounded-md border bg-card p-1 shadow-lg">
              <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" type="button">
                Profile
              </button>
              <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" type="button">
                Preferences
              </button>
              <button className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" type="button">
                Sign out
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
