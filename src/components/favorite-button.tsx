"use client";

import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import type { Id } from "@/../convex/_generated/dataModel";

interface Props {
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath: string | null;
  userId: Id<"users"> | null;
}

export function FavoriteButton({ mediaType, mediaId, title, posterPath, userId }: Props) {
  const { isSignedIn } = useUser();

  const isFavorited = useQuery(
    api.favorites.isFavorited,
    userId ? { userId, mediaType, mediaId } : "skip"
  );

  const toggle = useMutation(api.favorites.toggle);

  const [pending, setPending] = useState(false);

  const handleToggle = useCallback(async () => {
    if (!isSignedIn || !userId) {
      toast.error("Sign in to save favorites");
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      const result = await toggle({ userId, mediaType, mediaId, title, posterPath });
      toast.success(result.favorited ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPending(false);
    }
  }, [isSignedIn, userId, toggle, mediaType, mediaId, title, posterPath, pending]);

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size="icon"
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      onClick={handleToggle}
      disabled={pending}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
    </Button>
  );
}
