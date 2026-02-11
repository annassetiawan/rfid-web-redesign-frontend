import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { labelCards } from "@/lib/mock";

function toPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

export function LabelManagement() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Label Management</h2>
        <p className="text-sm text-muted-foreground">Tagged vs untagged labels across warehouse label types.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {labelCards.map((label) => {
          const usage = toPercent(label.tagged, label.total);

          return (
            <Card key={label.title}>
              <CardHeader>
                <CardTitle>{label.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-bold">{label.total.toLocaleString()}</p>
                <Progress value={usage} />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Tagged</p>
                    <p className="font-semibold">{label.tagged.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Untagged</p>
                    <p className="font-semibold">{label.untagged.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-semibold">{usage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
