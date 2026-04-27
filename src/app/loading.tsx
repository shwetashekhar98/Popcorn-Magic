import { HeroSkeleton, MediaRailSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-10 pb-16">
      <HeroSkeleton />
      <div className="container mx-auto max-w-7xl space-y-10">
        <MediaRailSkeleton title="Trending Today" />
        <MediaRailSkeleton title="Popular Movies" />
        <MediaRailSkeleton title="Popular TV Shows" />
        <MediaRailSkeleton title="Upcoming Movies" />
      </div>
    </div>
  );
}
