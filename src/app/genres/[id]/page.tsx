export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { discoverByGenre, getMovieGenres, getTVGenres } from "@/lib/tmdb/endpoints";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import type { Movie, TVShow } from "@/lib/tmdb/types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; page?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { type = "movie" } = await searchParams;
  const genreId = Number(id);
  const genres = type === "tv" ? await getTVGenres() : await getMovieGenres();
  const genre = genres.genres.find((g) => g.id === genreId);
  return { title: genre ? `${genre.name} ${type === "tv" ? "TV Shows" : "Movies"}` : "Genre" };
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type = "movie", page = "1" } = await searchParams;
  const genreId = Number(id);
  const currentPage = Math.max(1, Number(page));

  if (isNaN(genreId)) notFound();

  const mediaType = type === "tv" ? "tv" : "movie";
  const genres = mediaType === "tv" ? await getTVGenres() : await getMovieGenres();
  const genre = genres.genres.find((g) => g.id === genreId);

  if (!genre) notFound();

  const data = await discoverByGenre(mediaType, genreId, currentPage);
  const items = data.results as (Movie | TVShow)[];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{genre.name}</h1>
        <div className="flex gap-2">
          <Link href={`/genres/${id}?type=movie`}>
            <Button variant={mediaType === "movie" ? "default" : "outline"} size="sm">Movies</Button>
          </Link>
          <Link href={`/genres/${id}?type=tv`}>
            <Button variant={mediaType === "tv" ? "default" : "outline"} size="sm">TV Shows</Button>
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No results found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} mediaType={mediaType} />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 pt-4">
        {currentPage > 1 && (
          <Link href={`/genres/${id}?type=${mediaType}&page=${currentPage - 1}`}>
            <Button variant="outline">← Previous</Button>
          </Link>
        )}
        {currentPage < data.total_pages && (
          <Link href={`/genres/${id}?type=${mediaType}&page=${currentPage + 1}`}>
            <Button variant="outline">Next →</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
