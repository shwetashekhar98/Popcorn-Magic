"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sparkles, Star, Heart } from "lucide-react";
import { AIPicks } from "@/components/ai-picks";
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

export function ProfileContent() {
  const { user, isLoaded } = useUser();

  const convexUser = useQuery(
    api.users.current,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const reviews = useQuery(
    api.reviews.listByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const favorites = useQuery(
    api.favorites.listMine,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const removeReview = useMutation(api.reviews.remove);

  async function handleDeleteReview(reviewId: Id<"reviews">) {
    if (!convexUser) return;
    try {
      await removeReview({ reviewId, userId: convexUser._id });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (!isLoaded || convexUser === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!user) return <p className="text-muted-foreground">Please sign in to view your profile.</p>;
  if (convexUser === null) return <p className="text-muted-foreground">Setting up your profile…</p>;

  return (
    <div className="space-y-8">
      {/* User info header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
          <AvatarFallback>{user.firstName?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{user.fullName ?? user.firstName}</h2>
          <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
          <div className="flex gap-3 mt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3" /> {favorites?.length ?? 0} favorites
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3" /> {reviews?.length ?? 0} reviews
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="ai-picks">
        <TabsList>
          <TabsTrigger value="ai-picks" className="gap-2">
            <Sparkles className="h-3.5 w-3.5" /> AI Picks
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews {reviews ? `(${reviews.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-picks" className="mt-6">
          <AIPicks userId={convexUser._id} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {!reviews || reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No reviews yet. Watch something and share your thoughts!
            </p>
          ) : (
            <div className="space-y-4 max-w-2xl">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs">
                        ⭐ {review.rating}/10
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">{review.mediaType}</Badge>
                      <span className="text-xs text-muted-foreground">{relativeTime(review.createdAt)}</span>
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
    </div>
  );
}
