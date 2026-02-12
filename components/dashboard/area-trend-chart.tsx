"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AreaTrendChartProps = {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
  config: ChartConfig;
  xKey?: string;
  seriesKeys: string[];
  headerRight?: React.ReactNode;
  className?: string;
};

export function AreaTrendChart({
  title,
  subtitle,
  data,
  config,
  xKey = "day",
  seriesKeys,
  headerRight,
  className
}: AreaTrendChartProps) {
  return (
    <Card className={cn("border-border/60 bg-card shadow-sm", className)}>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {headerRight}
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-3">
          <ChartContainer config={config} className="min-h-[220px] w-full">
            <AreaChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              {seriesKeys.length > 1 && (
                <ChartLegend content={<ChartLegendContent />} />
              )}
              {seriesKeys.map((key) => (
                <Area
                  key={key}
                  type="natural"
                  dataKey={key}
                  fill={`var(--color-${key})`}
                  fillOpacity={0.3}
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
