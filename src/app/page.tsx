export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getTrending, getPopularMovies, getPopularTV, getUpcomingMovies } from "@/lib/tmdb/endpoints";
import { HeroRotator } from "@/components/hero-rotator";
import { MediaRail } from "@/components/media-rail";
import { HeroSkeleton, MediaRailSkeleton } from "@/components/skeletons";

async function Hero() {
  const data = await getTrending("day");
  const items = data.results.filter(
    (item): item is typeof item & { media_type: "movie" | "tv" } =>
      item.media_type === "movie" || item.media_type === "tv"
  );
  return <HeroRotator items={items} />;
}

async function TrendingRail() {
  const data = await getTrending("day");
  const items = data.results.filter(
    (item): item is typeof item & { media_type: "movie" | "tv" } =>
      item.media_type === "movie" || item.media_type === "tv"
  );
  return <MediaRail title="Trending Today" items={items} />;
}

async function PopularMoviesRail() {
  const data = await getPopularMovies();
  return <MediaRail title="Popular Movies" items={data.results} mediaType="movie" />;
}

async function PopularTVRail() {
  const data = await getPopularTV();
  return <MediaRail title="Popular TV Shows" items={data.results} mediaType="tv" />;
}

async function UpcomingRail() {
  const data = await getUpcomingMovies();
  return <MediaRail title="Upcoming Movies" items={data.results} mediaType="movie" />;
}

export default function HomePage() {
  return (
    <div className="space-y-10 pb-16">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      <div className="container mx-auto max-w-7xl space-y-10">
        <Suspense fallback={<MediaRailSkeleton title="Trending Today" />}>
          <TrendingRail />
        </Suspense>
        <Suspense fallback={<MediaRailSkeleton title="Popular Movies" />}>
          <PopularMoviesRail />
        </Suspense>
        <Suspense fallback={<MediaRailSkeleton title="Popular TV Shows" />}>
          <PopularTVRail />
        </Suspense>
        <Suspense fallback={<MediaRailSkeleton title="Upcoming Movies" />}>
          <UpcomingRail />
        </Suspense>
      </div>
    </div>
  );
}
