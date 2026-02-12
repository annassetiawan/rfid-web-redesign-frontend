import { ChartsSection } from "@/components/dashboard/charts-section";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { LabelManagement } from "@/components/dashboard/label-management";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-10 pt-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <p className="text-xs text-muted-foreground">Updated a few moments ago</p>
        </div>

        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Modern RFID operations view using frontend-only mock data.
          </p>
        </section>

        <KpiSection />
        <ChartsSection />
        <LabelManagement />
      </div>
    </div>
  );
}
