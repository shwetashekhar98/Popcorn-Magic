export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import { getTVDetails } from "@/lib/tmdb/endpoints";
import { tmdbImage, tmdbBackdrop } from "@/lib/tmdb/images";
import { Badge } from "@/components/ui/badge";
import { CastRow } from "@/components/cast-row";
import { MediaRail } from "@/components/media-rail";
import { TrailerModal } from "@/components/trailer-modal";
import { ReviewSection } from "@/components/review-section";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const show = await getTVDetails(Number(id));
    return {
      title: show.name,
      description: show.overview,
      openGraph: {
        images: show.poster_path ? [tmdbImage(show.poster_path, "w500")] : [],
      },
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TVPage({ params }: Props) {
  const { id } = await params;
  const tvId = Number(id);

  if (isNaN(tvId)) notFound();

  let show;
  try {
    show = await getTVDetails(tvId);
  } catch {
    notFound();
  }

  const cast = show.credits?.cast ?? [];
  const videos = show.videos?.results ?? [];
  const similar = (show.similar?.results ?? []).slice(0, 10);
  const recommendations = (show.recommendations?.results ?? []).slice(0, 10);
  const seasons = show.number_of_seasons;
  const episodes = show.number_of_episodes;

  return (
    <div className="pb-16">
      <div className="relative h-[50vh] min-h-[360px] w-full">
        <Image
          src={tmdbBackdrop(show.backdrop_path)}
          alt={show.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 -mt-32 relative space-y-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-40 md:w-52">
            <Image
              src={tmdbImage(show.poster_path, "w342")}
              alt={show.name}
              width={208}
              height={312}
              className="rounded-xl shadow-2xl w-full"
            />
          </div>

          <div className="flex-1 space-y-4 pt-4 md:pt-24">
            <div className="flex flex-wrap items-center gap-2">
              {show.genres?.map((g) => (
                <Badge key={g.id} variant="secondary">{g.name}</Badge>
              ))}
              {seasons && <Badge variant="outline">{seasons} season{seasons !== 1 ? "s" : ""}</Badge>}
              {episodes && <Badge variant="outline">{episodes} episodes</Badge>}
              <Badge variant="outline">⭐ {Math.round(show.vote_average * 10) / 10}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{show.name}</h1>
            {show.tagline && (
              <p className="text-muted-foreground italic">{show.tagline}</p>
            )}
            <p className="text-sm leading-relaxed max-w-2xl">{show.overview}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <TrailerModal videos={videos} />
              <ReviewSection mediaType="tv" mediaId={tvId} title={show.name} posterPath={show.poster_path} />
            </div>
          </div>
        </div>

        {cast.length > 0 && <CastRow cast={cast} />}
        {similar.length > 0 && (
          <MediaRail title="Similar Shows" items={similar} mediaType="tv" />
        )}
        {recommendations.length > 0 && (
          <MediaRail title="Recommended" items={recommendations} mediaType="tv" />
        )}
      </div>
    </div>
  );
}
