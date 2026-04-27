"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function FavoritesList() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.current, user?.id ? { clerkId: user.id } : "skip");
  const favorites = useQuery(api.favorites.listMine, convexUser ? { userId: convexUser._id } : "skip");
  const toggleFav = useMutation(api.favorites.toggle);

  if (!user) return <p className="text-muted-foreground">Please sign in to view your favorites.</p>;
  if (favorites === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-24">
        No favorites yet. Browse movies & TV shows and click ♥ to save them here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {favorites.map((fav) => (
        <div key={fav._id} className="space-y-1">
          <MediaCard
            item={{
              id: fav.mediaId,
              media_type: fav.mediaType,
              ...(fav.mediaType === "movie"
                ? { title: fav.title, release_date: "" }
                : { name: fav.title, first_air_date: "" }),
              poster_path: fav.posterPath,
              backdrop_path: null,
              overview: "",
              vote_average: 0,
              vote_count: 0,
            } as Parameters<typeof MediaCard>[0]["item"]}
            mediaType={fav.mediaType}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-destructive"
            onClick={async () => {
              if (!convexUser) return;
              try {
                await toggleFav({ userId: convexUser._id, mediaType: fav.mediaType, mediaId: fav.mediaId, title: fav.title, posterPath: fav.posterPath });
                toast.success("Removed from favorites");
              } catch {
                toast.error("Failed to remove");
              }
            }}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
