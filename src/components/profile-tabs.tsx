"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaCard } from "@/components/media-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";
import type { Id } from "@/../convex/_generated/dataModel";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function TabsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileTabs() {
  const { user, isLoaded } = useUser();

  const convexUser = useQuery(
    api.users.current,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const getOrCreate = useMutation(api.users.getOrCreate);

  // If signed in but no Convex user record, create it now
  useEffect(() => {
    if (!isLoaded || !user || convexUser !== null) return;
    getOrCreate({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? user.firstName ?? "Anonymous",
      imageUrl: user.imageUrl ?? "",
    }).catch(console.error);
  }, [isLoaded, user, convexUser, getOrCreate]);

  const reviews = useQuery(
    api.reviews.listByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const favorites = useQuery(
    api.favorites.listMine,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const removeReview = useMutation(api.reviews.remove);
  const toggleFav = useMutation(api.favorites.toggle);

  async function handleDeleteReview(reviewId: Id<"reviews">) {
    if (!convexUser) return;
    try {
      await removeReview({ reviewId, userId: convexUser._id });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleRemoveFav(fav: {
    userId: Id<"users">;
    mediaType: "movie" | "tv";
    mediaId: number;
    title: string;
    posterPath: string | null;
  }) {
    try {
      await toggleFav(fav);
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed to remove");
    }
  }

  // Still waiting for Clerk to load
  if (!isLoaded) return <TabsSkeleton />;

  // Not signed in
  if (!user) {
    return (
      <p className="text-muted-foreground">
        Please sign in to view your profile.
      </p>
    );
  }

  // Waiting for Convex query to resolve (undefined = in-flight)
  if (convexUser === undefined) return <TabsSkeleton />;

  // Convex user is null — being created via useEffect above
  if (convexUser === null) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">Setting up your profile…</p>
        <TabsSkeleton />
      </div>
    );
  }

  return (
    <Tabs defaultValue="favorites">
      <TabsList className="mb-6">
        <TabsTrigger value="favorites">
          Favorites {favorites ? `(${favorites.length})` : ""}
        </TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews {reviews ? `(${reviews.length})` : ""}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="favorites">
        {!favorites ? (
          <TabsSkeleton />
        ) : favorites.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No favorites yet. Start exploring and save what you love!
          </p>
        ) : (
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
                  onClick={() =>
                    handleRemoveFav({
                      userId: convexUser._id,
                      mediaType: fav.mediaType,
                      mediaId: fav.mediaId,
                      title: fav.title,
                      posterPath: fav.posterPath,
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="reviews">
        {!reviews ? (
          <TabsSkeleton />
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No reviews yet. Watch something and share your thoughts!
          </p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border border-border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs">
                      ⭐ {review.rating}/10
                    </Badge>
                    <Badge variant="outline" className="capitalize text-xs">
                      {review.mediaType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(review.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
