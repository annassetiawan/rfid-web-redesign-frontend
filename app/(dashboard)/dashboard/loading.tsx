import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
    </section>
  );
}
