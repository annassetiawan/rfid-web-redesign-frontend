import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trends } from "@/lib/mock";

function TrendBars({ values }: { values: number[] }) {
  const max = Math.max(...values);

  return (
    <div className="flex h-40 items-end gap-2">
      {values.map((value, index) => {
        const height = Math.max(8, Math.round((value / max) * 100));

        return (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded bg-primary/85" style={{ height: `${height}%` }} />
          </div>
        );
      })}
    </div>
  );
}

export function ChartsSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Trend Charts</h2>
        <p className="text-sm text-muted-foreground">Seven-day movement for delivery and pickup activity.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {trends.map((series) => (
          <Card key={series.title}>
            <CardHeader>
              <CardTitle>{series.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendBars values={series.points.map((point) => point.value)} />
              <div className="mt-3 grid grid-cols-7 text-center text-xs text-muted-foreground">
                {series.points.map((point) => (
                  <span key={`${series.title}-${point.day}`}>{point.day}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
