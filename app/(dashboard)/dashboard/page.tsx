import { ChartsSection } from "@/components/dashboard/charts-section";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { LabelManagement } from "@/components/dashboard/label-management";
import { RequestStatusSummary } from "@/components/dashboard/request-status-summary";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Modern RFID operations view using frontend-only mock data.
        </p>
      </section>

      <KpiSection />
      <RequestStatusSummary />
      <LabelManagement />
      <ChartsSection />
    </div>
  );
}
