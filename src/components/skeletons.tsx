import { Skeleton } from "@/components/ui/skeleton";

export function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-36 flex-shrink-0">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}

export function MediaRailSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-hidden pb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return <Skeleton className="h-[60vh] min-h-[400px] w-full" />;
}

export function DetailHeroSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[50vh] w-full" />
      <div className="container mx-auto max-w-7xl px-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
