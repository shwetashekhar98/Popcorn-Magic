import { tmdbFetch } from "./client";
import type {
  Movie,
  TVShow,
  MediaItem,
  PaginatedResponse,
  GenreListResponse,
} from "./types";

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
