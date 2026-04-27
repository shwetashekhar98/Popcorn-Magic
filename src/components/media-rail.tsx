import { MediaCard } from "@/components/media-card";
import type { Movie, TVShow } from "@/lib/tmdb/types";

type RailItem = (Movie & { media_type: "movie" }) | (TVShow & { media_type: "tv" }) | Movie | TVShow;

interface Props {
  title: string;
  items: RailItem[];
  mediaType?: "movie" | "tv";
}

export function MediaRail({ title, items, mediaType }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold px-4 md:px-0">{title}</h2>
      <div
        className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-0 scrollbar-hide"
        role="list"
        aria-label={title}
      >
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <MediaCard item={item} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </section>
  );
}
