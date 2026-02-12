import { AreaTrendChart } from "@/components/dashboard/area-trend-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trends } from "@/lib/mock";

export function ChartsSection() {
  const combinedTrend = trends[0].points.map((point, index) => ({
    day: point.day,
    delivery: point.value,
    pickup: trends[1]?.points[index]?.value ?? 0
  }));

  return (
    <section className="space-y-4">
      <AreaTrendChart
        title="Trend Overview"
        subtitle="Delivery vs pickup volume"
        data={combinedTrend}
        seriesKeys={["delivery", "pickup"]}
        config={{
          delivery: { label: "Delivery", color: "hsl(var(--chart-1))" },
          pickup: { label: "Pickup", color: "hsl(var(--chart-2))" }
        }}
        headerRight={(
          <Tabs defaultValue="7d" className="w-full md:w-auto">
            <TabsList className="h-9 w-full md:w-auto">
              <TabsTrigger value="7d" className="text-xs">
                Last 7 days
              </TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">
                30 days
              </TabsTrigger>
              <TabsTrigger value="90d" className="text-xs">
                3 months
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AreaTrendChart
          title="Delivery Trend"
          subtitle="Last 7 days"
          data={trends[0].points.map((point) => ({ day: point.day, delivery: point.value }))}
          seriesKeys={["delivery"]}
          config={{
            delivery: { label: "Delivery", color: "hsl(var(--chart-1))" }
          }}
        />
        <AreaTrendChart
          title="Pickup Trend"
          subtitle="Last 7 days"
          data={trends[1].points.map((point) => ({ day: point.day, pickup: point.value }))}
          seriesKeys={["pickup"]}
          config={{
            pickup: { label: "Pickup", color: "hsl(var(--chart-2))" }
          }}
        />
      </div>
    </section>
  );
}
