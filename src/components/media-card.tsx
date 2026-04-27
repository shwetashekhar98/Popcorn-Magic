import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/images";
import { Badge } from "@/components/ui/badge";
import type { Movie, TVShow } from "@/lib/tmdb/types";

type Props = {
  item: (Movie & { media_type: "movie" }) | (TVShow & { media_type: "tv" }) | Movie | TVShow;
  mediaType?: "movie" | "tv";
};

function getTitle(item: Movie | TVShow): string {
  return "title" in item ? item.title : item.name;
}

function getYear(item: Movie | TVShow): string {
  const date = "release_date" in item ? item.release_date : item.first_air_date;
  return date ? date.slice(0, 4) : "—";
}

function getMediaType(item: Movie | TVShow, fallback?: "movie" | "tv"): "movie" | "tv" {
  if ("media_type" in item && (item.media_type === "movie" || item.media_type === "tv")) {
    return item.media_type;
  }
  return fallback ?? ("title" in item ? "movie" : "tv");
}

export function MediaCard({ item, mediaType }: Props) {
  const type = getMediaType(item, mediaType);
  const title = getTitle(item);
  const year = getYear(item);
  const href = `/${type}/${item.id}`;
  const rating = Math.round(item.vote_average * 10) / 10;

  return (
    <Link href={href} className="group flex flex-col gap-2 w-36 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={tmdbImage(item.poster_path, "w342")}
          alt={title}
          fill
          sizes="144px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {rating > 0 && (
          <div className="absolute top-2 right-2">
            <Badge className="text-xs px-1.5 py-0.5 bg-black/70 text-white border-0">
              ⭐ {rating}
            </Badge>
          </div>
        )}
      </div>
      <div className="px-0.5">
        <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </p>
        {year !== "—" && (
          <p className="text-xs text-muted-foreground mt-0.5">{year}</p>
        )}
      </div>
    </Link>
  );
}
