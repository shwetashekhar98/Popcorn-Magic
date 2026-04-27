export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { searchMulti } from "@/lib/tmdb/endpoints";
import { MediaCard } from "@/components/media-card";
import { SearchBar } from "@/components/search-bar";
import { MediaCardSkeleton } from "@/components/skeletons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function Results({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <p className="text-center text-muted-foreground py-16">
        Start typing to search for movies and TV shows.
      </p>
    );
  }

  const data = await searchMulti(query);
  const items = data.results.filter(
    (item): item is typeof item & { media_type: "movie" | "tv" } =>
      item.media_type === "movie" || item.media_type === "tv"
  );

  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16">
        No results found for &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {items.map((item) => (
        <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
      ))}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q ?? "";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <SearchBar defaultValue={query} />
      </div>
      <Suspense key={query} fallback={<ResultsSkeleton />}>
        <Results query={query} />
      </Suspense>
    </div>
  );
}
