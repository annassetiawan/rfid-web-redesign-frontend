import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestSummary } from "@/lib/mock";

const toneClasses = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700"
} as const;

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
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ${toneClasses[item.tone]}`}>
                        {block.title}
                      </span>
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
