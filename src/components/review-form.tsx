"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import type { Id } from "@/../convex/_generated/dataModel";

const schema = z.object({
  rating: z.number().int().min(1).max(10),
  text: z.string().min(1, "Review text is required").max(2000),
});

interface Props {
  mediaType: "movie" | "tv";
  mediaId: number;
  userId: Id<"users">;
}

export function ReviewForm({ mediaType, mediaId, userId }: Props) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const upsert = useMutation(api.reviews.upsert);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ rating, text });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await upsert({ userId, mediaType, mediaId, rating, text });
      toast.success("Review saved!");
      setText("");
      setRating(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
      <h3 className="font-semibold">Write a Review</h3>
      <div className="flex items-center gap-1" role="group" aria-label="Rating">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} out of 10`}
            onClick={() => setRating(n)}
            className={`w-7 h-7 rounded text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              n <= rating
                ? "bg-yellow-500 text-black"
                : "bg-muted text-muted-foreground hover:bg-yellow-400 hover:text-black"
            }`}
          >
            {n}
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">{rating}/10</span>
        )}
      </div>
      <Textarea
        placeholder="Share your thoughts…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={2000}
        aria-label="Review text"
      />
      <Button type="submit" disabled={loading || rating === 0}>
        {loading ? "Saving…" : "Submit Review"}
      </Button>
    </form>
  );
}
