"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { FavoriteButton } from "@/components/favorite-button";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { toast } from "sonner";
import type { Id } from "@/../convex/_generated/dataModel";

interface Props {
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath: string | null;
}

export function ReviewSection({ mediaType, mediaId, title, posterPath }: Props) {
  const { user, isSignedIn } = useUser();

  const convexUser = useQuery(
    api.users.current,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const removeReview = useMutation(api.reviews.remove);

  async function handleDelete(reviewId: Id<"reviews">) {
    if (!convexUser) return;
    try {
      await removeReview({ reviewId, userId: convexUser._id });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <FavoriteButton
          mediaType={mediaType}
          mediaId={mediaId}
          title={title}
          posterPath={posterPath}
          userId={convexUser?._id ?? null}
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {isSignedIn && convexUser && (
          <ReviewForm mediaType={mediaType} mediaId={mediaId} userId={convexUser._id} />
        )}
        {!isSignedIn && (
          <p className="text-sm text-muted-foreground">Sign in to leave a review.</p>
        )}
        <ReviewList
          mediaType={mediaType}
          mediaId={mediaId}
          currentUserId={convexUser?._id}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}
