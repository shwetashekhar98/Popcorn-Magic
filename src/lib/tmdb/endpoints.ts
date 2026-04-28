import { tmdbFetch } from "./client";
import type {
  Movie,
  TVShow,
  MediaItem,
  PaginatedResponse,
  GenreListResponse,
} from "./types";

export interface SearchResult {
  id: number;
  poster_path: string | null;
}

interface DiscoverItem {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
}

export interface HiddenGemItem {
  id: number;
  title: string;
  year: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
}

export function getTrending(window: "day" | "week") {
  return tmdbFetch<PaginatedResponse<MediaItem>>(`/trending/all/${window}`, {
    revalidate: 3600,
  });
}

export function getPopularMovies(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>("/movie/popular", {
    revalidate: 3600,
    searchParams: { page },
  });
}

export function getPopularTV(page = 1) {
  return tmdbFetch<PaginatedResponse<TVShow>>("/tv/popular", {
    revalidate: 3600,
    searchParams: { page },
  });
}

export function getUpcomingMovies(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>("/movie/upcoming", {
    revalidate: 3600,
    searchParams: { page },
  });
}

export function searchMulti(query: string, page = 1) {
  return tmdbFetch<PaginatedResponse<MediaItem>>("/search/multi", {
    cache: "no-store",
    searchParams: { query, page },
  });
}

export function getMovieDetails(id: number) {
  return tmdbFetch<Movie>(`/movie/${id}`, {
    revalidate: 86400,
    searchParams: {
      append_to_response: "credits,videos,similar,recommendations",
    },
  });
}

export function getTVDetails(id: number) {
  return tmdbFetch<TVShow>(`/tv/${id}`, {
    revalidate: 86400,
    searchParams: {
      append_to_response: "credits,videos,similar,recommendations",
    },
  });
}

export function getMovieGenres() {
  return tmdbFetch<GenreListResponse>("/genre/movie/list", {
    revalidate: 86400,
  });
}

export function getTVGenres() {
  return tmdbFetch<GenreListResponse>("/genre/tv/list", {
    revalidate: 86400,
  });
}

export function discoverByGenre(
  mediaType: "movie" | "tv",
  genreId: number,
  page = 1
) {
  return tmdbFetch<PaginatedResponse<Movie | TVShow>>(`/discover/${mediaType}`, {
    revalidate: 3600,
    searchParams: { with_genres: genreId, page },
  });
}

export async function searchByTitleYear(
  title: string,
  year: string,
  mediaType: "movie" | "tv"
): Promise<SearchResult | null> {
  try {
    if (mediaType === "movie") {
      const res = await tmdbFetch<PaginatedResponse<{ id: number; poster_path: string | null }>>(
        "/search/movie",
        {
          cache: "no-store",
          searchParams: { query: title, primary_release_year: year },
        }
      );
      const first = res.results[0];
      return first ? { id: first.id, poster_path: first.poster_path } : null;
    } else {
      const res = await tmdbFetch<PaginatedResponse<{ id: number; poster_path: string | null }>>(
        "/search/tv",
        {
          cache: "no-store",
          searchParams: { query: title, first_air_date_year: year },
        }
      );
      const first = res.results[0];
      return first ? { id: first.id, poster_path: first.poster_path } : null;
    }
  } catch {
    return null;
  }
}

export async function discoverHiddenGems(
  mediaType: "movie" | "tv",
  genreIds: number[],
  count: number
): Promise<HiddenGemItem[]> {
  const res = await tmdbFetch<PaginatedResponse<DiscoverItem>>(`/discover/${mediaType}`, {
    revalidate: 3600,
    searchParams: {
      with_genres: genreIds.join("|"),
      "vote_count.lte": 2000,
      "vote_average.gte": 6.5,
      sort_by: "vote_average.desc",
      page: 1,
    },
  });

  return res.results.slice(0, count).map((item) => ({
    id: item.id,
    title: item.title ?? item.name ?? "",
    year:
      (mediaType === "movie" ? item.release_date : item.first_air_date)?.slice(0, 4) ?? "",
    posterPath: item.poster_path,
    mediaType,
  }));
}
