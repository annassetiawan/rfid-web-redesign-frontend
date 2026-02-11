import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestSummary } from "@/lib/mock";

export function RequestStatusSummary() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Request Status Summary</h2>
        <p className="text-sm text-muted-foreground">Delivery and pickup progress at a glance.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {requestSummary.map((block) => (
          <Card key={block.title}>
            <CardHeader>
              <CardTitle>{block.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {block.items.map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xl font-semibold">{item.value}</p>
                      <Badge variant={item.tone}>{block.title}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
