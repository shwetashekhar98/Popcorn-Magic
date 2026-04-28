"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import { tmdbImage } from "@/lib/tmdb/images";
import { cn } from "@/lib/utils";
import type { RailPick } from "@/app/api/recommendations/route";
import type { Id } from "@/../convex/_generated/dataModel";

interface Props {
  pick: RailPick;
  userId: Id<"users">;
}

export function PickCard({ pick, userId }: Props) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const recordFeedback = useMutation(api.feedback.record);

  const href = `/${pick.mediaType}/${pick.tmdbId}`;

  async function handleFeedback(e: React.MouseEvent, signal: "up" | "down") {
    e.preventDefault();
    e.stopPropagation();
    if (voted !== null) return;
    setVoted(signal);
    try {
      await recordFeedback({
        userId,
        tmdbId: pick.tmdbId,
        mediaType: pick.mediaType,
        signal,
        title: pick.title,
      });
      toast.success(signal === "up" ? "Noted!" : "Got it — we'll update your picks");
    } catch {
      setVoted(null);
      toast.error("Failed to record feedback");
    }
  }

  return (
    <div className="flex flex-col w-36 flex-shrink-0">
      <Link href={href} className="group flex flex-col gap-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={tmdbImage(pick.posterPath, "w342")}
            alt={pick.title}
            fill
            sizes="144px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <p className="text-sm font-medium leading-tight line-clamp-2 mt-2 group-hover:text-primary transition-colors">
          {pick.title}
        </p>
        {pick.year && (
          <p className="text-xs text-muted-foreground mt-0.5">{pick.year}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
          {pick.reason}
        </p>
      </Link>

      <div className="flex gap-1 mt-2">
        <button
          onClick={(e) => handleFeedback(e, "up")}
          disabled={voted !== null}
          className={cn(
            "flex-1 text-sm py-1 rounded transition-colors hover:bg-green-500/20",
            voted === "up" && "text-green-500",
            voted === "down" && "opacity-30"
          )}
          aria-label="Thumbs up"
        >
          👍
        </button>
        <button
          onClick={(e) => handleFeedback(e, "down")}
          disabled={voted !== null}
          className={cn(
            "flex-1 text-sm py-1 rounded transition-colors hover:bg-red-500/20",
            voted === "down" && "text-red-500",
            voted === "up" && "opacity-30"
          )}
          aria-label="Thumbs down"
        >
          👎
        </button>
      </div>
    </div>
  );
}
