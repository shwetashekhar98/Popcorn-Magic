import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb/images";
import type { CastMember } from "@/lib/tmdb/types";

interface Props {
  cast: CastMember[];
}

export function CastRow({ cast }: Props) {
  const top = cast.slice(0, 10);

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Top Cast</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" role="list" aria-label="Cast">
        {top.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-1 w-20 flex-shrink-0" role="listitem">
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted">
              <Image
                src={tmdbImage(member.profile_path, "w154")}
                alt={member.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <p className="text-xs font-medium text-center line-clamp-2 leading-tight">{member.name}</p>
            <p className="text-xs text-muted-foreground text-center line-clamp-2 leading-tight">{member.character}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
