const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const PLACEHOLDER = "https://placehold.co/342x513/1a1a2e/ffffff?text=No+Image";
const BACKDROP_PLACEHOLDER = "https://placehold.co/1280x720/1a1a2e/ffffff?text=No+Image";

export type PosterSize = "w154" | "w342" | "w500" | "w780" | "original";
export type BackdropSize = "w300" | "w780" | "w1280" | "original";

export function tmdbImage(path: string | null | undefined, size: PosterSize = "w342"): string {
  if (!path) return PLACEHOLDER;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function tmdbBackdrop(path: string | null | undefined, size: BackdropSize = "w1280"): string {
  if (!path) return BACKDROP_PLACEHOLDER;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
