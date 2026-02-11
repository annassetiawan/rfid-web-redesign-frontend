import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { kpiCards } from "@/lib/mock";

export function KpiSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Performance KPIs</h2>
        <p className="text-sm text-muted-foreground">Current period overview for request and RFID flow.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-muted-foreground">{kpi.title}</CardTitle>
                <span className="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
