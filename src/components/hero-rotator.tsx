"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { tmdbBackdrop } from "@/lib/tmdb/images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import type { MediaItem } from "@/lib/tmdb/types";

interface Props {
  items: MediaItem[];
}

function getTitle(item: MediaItem) {
  return item.media_type === "movie" ? item.title : item.name;
}

function getYear(item: MediaItem) {
  const date = item.media_type === "movie" ? item.release_date : item.first_air_date;
  return date?.slice(0, 4) ?? "";
}

export function HeroRotator({ items }: Props) {
  const [index, setIndex] = useState(0);
  const top = items.slice(0, 5);

  const prev = useCallback(() => setIndex((i) => (i === 0 ? top.length - 1 : i - 1)), [top.length]);
  const next = useCallback(() => setIndex((i) => (i === top.length - 1 ? 0 : i + 1)), [top.length]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const current = top[index];
  if (!current) return null;

  const title = getTitle(current);
  const year = getYear(current);
  const href = `/${current.media_type}/${current.id}`;

  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden" aria-label="Featured">
      <Image
        src={tmdbBackdrop(current.backdrop_path)}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 p-8 max-w-xl space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{current.media_type}</Badge>
          <span className="text-sm text-muted-foreground">{year}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
        <p className="text-sm text-muted-foreground line-clamp-3">{current.overview}</p>
        <Link href={href}>
          <Button className="gap-2 mt-2">
            <Info className="h-4 w-4" />
            More Info
          </Button>
        </Link>
      </div>

      <div className="absolute right-4 bottom-1/2 translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={prev}
          aria-label="Previous"
          className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {top.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-ring ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
