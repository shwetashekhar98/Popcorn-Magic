import { tmdbFetch } from "@/lib/tmdb/client";
import type { Id } from "@/../convex/_generated/dataModel";

export interface FavDoc {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  addedAt: number;
}

export interface ReviewDoc {
  mediaId: number;
  mediaType: "movie" | "tv";
  rating: number;
  createdAt: number;
}

export interface GenreScore {
  id: number;
  name: string;
}

export interface TasteProfile {
  topGenres: GenreScore[];
  avgRating: number;
  ratingBias: "harsh" | "balanced" | "generous";
  mediaSplit: number;
  recentSignals: Array<{ title: string; rating?: number; genres: number[] }>;
  lovedExamples: Array<{ title: string; rating: number; genres: number[] }>;
  dislikedExamples: Array<{ title: string; rating: number; genres: number[] }>;
}

interface ItemDetails {
  title: string;
  genreIds: number[];
}

async function fetchGenreMap(): Promise<Map<number, string>> {
  const [movieRes, tvRes] = await Promise.all([
    tmdbFetch<{ genres: Array<{ id: number; name: string }> }>("/genre/movie/list", {
      revalidate: 86400,
    }),
    tmdbFetch<{ genres: Array<{ id: number; name: string }> }>("/genre/tv/list", {
      revalidate: 86400,
    }),
  ]);
  const map = new Map<number, string>();
  for (const g of [...movieRes.genres, ...tvRes.genres]) {
    map.set(g.id, g.name);
  }
  return map;
}

async function fetchItemDetails(
  mediaId: number,
  mediaType: "movie" | "tv",
  cache: Map<string, ItemDetails>
): Promise<ItemDetails> {
  const key = `${mediaType}:${mediaId}`;
  const hit = cache.get(key);
  if (hit) return hit;

  try {
    const data = await tmdbFetch<{
      genre_ids?: number[];
      genres?: Array<{ id: number }>;
      title?: string;
      name?: string;
    }>(`/${mediaType}/${mediaId}`, { revalidate: 86400 });

    const result: ItemDetails = {
      title: data.title ?? data.name ?? "",
      genreIds: data.genre_ids ?? data.genres?.map((g) => g.id) ?? [],
    };
    cache.set(key, result);
    return result;
  } catch {
    const fallback: ItemDetails = { title: "", genreIds: [] };
    cache.set(key, fallback);
    return fallback;
  }
}

export async function buildTasteProfile(
  _userId: Id<"users">,
  favorites: FavDoc[],
  reviews: ReviewDoc[]
): Promise<TasteProfile> {
  const cache = new Map<string, ItemDetails>();

  const [genreMap] = await Promise.all([
    fetchGenreMap(),
    Promise.all([
      ...favorites.map((f) => fetchItemDetails(f.mediaId, f.mediaType, cache)),
      ...reviews.map((r) => fetchItemDetails(r.mediaId, r.mediaType, cache)),
    ]),
  ]);

  // Genre weighted scores
  const genreWeights = new Map<number, number>();
  const genreCounts = new Map<number, number>();

  for (const fav of favorites) {
    const details = cache.get(`${fav.mediaType}:${fav.mediaId}`);
    if (!details) continue;
    for (const gid of details.genreIds) {
      genreWeights.set(gid, (genreWeights.get(gid) ?? 0) + 1.0);
      genreCounts.set(gid, (genreCounts.get(gid) ?? 0) + 1);
    }
  }

  for (const rev of reviews) {
    const weight = rev.rating / 10;
    const details = cache.get(`${rev.mediaType}:${rev.mediaId}`);
    if (!details) continue;
    for (const gid of details.genreIds) {
      genreWeights.set(gid, (genreWeights.get(gid) ?? 0) + weight);
      genreCounts.set(gid, (genreCounts.get(gid) ?? 0) + 1);
    }
  }

  // Sort: score DESC → count DESC → id ASC (deterministic)
  const sortedIds = Array.from(genreWeights.keys()).sort((a, b) => {
    const scoreDiff = (genreWeights.get(b) ?? 0) - (genreWeights.get(a) ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const countDiff = (genreCounts.get(b) ?? 0) - (genreCounts.get(a) ?? 0);
    if (countDiff !== 0) return countDiff;
    return a - b;
  });

  const topGenres: GenreScore[] = sortedIds.slice(0, 5).map((id) => ({
    id,
    name: genreMap.get(id) ?? String(id),
  }));

  // Rating stats
  const ratings = reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const ratingBias: TasteProfile["ratingBias"] =
    avgRating < 6 ? "harsh" : avgRating > 8 ? "generous" : "balanced";

  // Media split (0=all TV, 1=all movies)
  const totalItems = favorites.length + reviews.length;
  const movieItems =
    favorites.filter((f) => f.mediaType === "movie").length +
    reviews.filter((r) => r.mediaType === "movie").length;
  const mediaSplit = totalItems > 0 ? movieItems / totalItems : 0.5;

  // Recent signals: last 10 items sorted by recency
  type RawSignal = {
    time: number;
    mediaId: number;
    mediaType: "movie" | "tv";
    rating?: number;
    favTitle?: string;
  };

  const allRaw: RawSignal[] = [
    ...favorites.map((f) => ({
      time: f.addedAt,
      mediaId: f.mediaId,
      mediaType: f.mediaType,
      favTitle: f.title,
    })),
    ...reviews.map((r) => ({
      time: r.createdAt,
      mediaId: r.mediaId,
      mediaType: r.mediaType,
      rating: r.rating,
    })),
  ];
  allRaw.sort((a, b) => b.time - a.time);

  const recentSignals = allRaw.slice(0, 10).map((s) => {
    const details = cache.get(`${s.mediaType}:${s.mediaId}`);
    const title = s.favTitle ?? details?.title ?? "";
    return { title, rating: s.rating, genres: details?.genreIds ?? [] };
  });

  const lovedExamples = reviews
    .filter((r) => r.rating >= 9)
    .map((r) => {
      const details = cache.get(`${r.mediaType}:${r.mediaId}`);
      return { title: details?.title ?? "", rating: r.rating, genres: details?.genreIds ?? [] };
    })
    .filter((e) => e.title.length > 0);

  const dislikedExamples = reviews
    .filter((r) => r.rating <= 4)
    .map((r) => {
      const details = cache.get(`${r.mediaType}:${r.mediaId}`);
      return { title: details?.title ?? "", rating: r.rating, genres: details?.genreIds ?? [] };
    })
    .filter((e) => e.title.length > 0);

  return {
    topGenres,
    avgRating,
    ratingBias,
    mediaSplit,
    recentSignals,
    lovedExamples,
    dislikedExamples,
  };
}
