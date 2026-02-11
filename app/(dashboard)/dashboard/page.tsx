import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">
          Baseline placeholder for widgets and RFID monitoring panels.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <article
            key={idx}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <h3 className="text-sm font-medium">Placeholder Card {idx + 1}</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Connect mock data widgets in the next step.
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Empty state: no reader events to display yet.
        </p>
      </div>
    </section>
  );
}
