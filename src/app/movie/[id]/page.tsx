export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import { getMovieDetails } from "@/lib/tmdb/endpoints";
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
    const movie = await getMovieDetails(Number(id));
    return {
      title: movie.title,
      description: movie.overview,
      openGraph: {
        images: movie.poster_path ? [tmdbImage(movie.poster_path, "w500")] : [],
      },
    };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const movieId = Number(id);

  if (isNaN(movieId)) notFound();

  let movie;
  try {
    movie = await getMovieDetails(movieId);
  } catch {
    notFound();
  }

  const cast = movie.credits?.cast ?? [];
  const videos = movie.videos?.results ?? [];
  const similar = (movie.similar?.results ?? []).slice(0, 10);
  const recommendations = (movie.recommendations?.results ?? []).slice(0, 10);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  return (
    <div className="pb-16">
      <div className="relative h-[50vh] min-h-[360px] w-full">
        <Image
          src={tmdbBackdrop(movie.backdrop_path)}
          alt={movie.title}
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
              src={tmdbImage(movie.poster_path, "w342")}
              alt={movie.title}
              width={208}
              height={312}
              className="rounded-xl shadow-2xl w-full"
            />
          </div>

          <div className="flex-1 space-y-4 pt-4 md:pt-24">
            <div className="flex flex-wrap items-center gap-2">
              {movie.genres?.map((g) => (
                <Badge key={g.id} variant="secondary">{g.name}</Badge>
              ))}
              {runtime && <Badge variant="outline">{runtime}</Badge>}
              <Badge variant="outline">⭐ {Math.round(movie.vote_average * 10) / 10}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-muted-foreground italic">{movie.tagline}</p>
            )}
            <p className="text-sm leading-relaxed max-w-2xl">{movie.overview}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <TrailerModal videos={videos} />
              <ReviewSection mediaType="movie" mediaId={movieId} title={movie.title} posterPath={movie.poster_path} />
            </div>
          </div>
        </div>

        {cast.length > 0 && <CastRow cast={cast} />}
        {similar.length > 0 && (
          <MediaRail title="Similar Movies" items={similar} mediaType="movie" />
        )}
        {recommendations.length > 0 && (
          <MediaRail title="Recommended" items={recommendations} mediaType="movie" />
        )}
      </div>
    </div>
  );
}
