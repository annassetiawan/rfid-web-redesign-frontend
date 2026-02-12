import { Badge } from "@/components/ui/badge";
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
            <Card
              key={kpi.title}
              className="border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit text-[11px]">
                    +12%
                  </Badge>
                </div>
                <span className="rounded-md border border-border/60 bg-muted/40 p-2 text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold tracking-tight text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted/60">
                  <div className="h-full w-2/3 rounded-full bg-primary/60" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
