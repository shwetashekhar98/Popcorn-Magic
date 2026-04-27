import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
