"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/../convex/_generated/dataModel";

interface Props {
  mediaType: "movie" | "tv";
  mediaId: number;
  currentUserId?: Id<"users">;
  onDelete?: (reviewId: Id<"reviews">) => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ReviewList({ mediaType, mediaId, currentUserId, onDelete }: Props) {
  const reviews = useQuery(api.reviews.listByMedia, { mediaType, mediaId });

  if (reviews === undefined) {
    return <p className="text-sm text-muted-foreground">Loading reviews…</p>;
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No reviews yet. Be the first!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs">
                ⭐ {review.rating}/10
              </Badge>
              <span className="text-xs text-muted-foreground">{relativeTime(review.createdAt)}</span>
            </div>
            {currentUserId && currentUserId === review.userId && onDelete && (
              <button
                onClick={() => onDelete(review._id)}
                className="text-xs text-destructive hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label="Delete review"
              >
                Delete
              </button>
            )}
          </div>
          <p className="text-sm leading-relaxed">{review.text}</p>
        </div>
      ))}
    </div>
  );
}
