"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/../convex/_generated/dataModel";
interface Recommendation {
  title: string;
  mediaType: "movie" | "tv";
  reason: string;
  genre: string;
}

interface Props {
  userId: Id<"users">;
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-base leading-tight">{rec.title}</h3>
        <Badge variant="outline" className="capitalize text-xs shrink-0">{rec.mediaType}</Badge>
      </div>
      <Badge className="w-fit bg-primary/10 text-primary border-primary/20 text-xs">{rec.genre}</Badge>
      <p className="text-sm text-muted-foreground flex-1">{rec.reason}</p>
      <Link href={`/search?q=${encodeURIComponent(rec.title)}`}>
        <Button variant="outline" size="sm" className="w-full text-xs">Find it →</Button>
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function AIPicks({ userId }: Props) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const favorites = useQuery(api.favorites.listMine, { userId });
  const reviews = useQuery(api.reviews.listByUser, { userId });

  async function fetchRecommendations(favs = favorites, revs = reviews) {
    if (!favs || !revs || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favorites: favs.map((f) => ({ title: f.title, mediaType: f.mediaType })),
          reviews: revs.map((r) => ({ mediaType: r.mediaType, rating: r.rating })),
        }),
      });
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }

  useEffect(() => {
    if (favorites && reviews && !fetched) {
      fetchRecommendations(favorites, reviews);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites, reviews]);

  const dataReady = favorites !== undefined && reviews !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">AI Picks For You</h2>
        </div>
        {fetched && (
          <Button variant="ghost" size="sm" onClick={() => fetchRecommendations(favorites, reviews)} disabled={loading} className="gap-2 text-xs">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>

      {!dataReady || loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">
            {favorites.length === 0
              ? "Add some favorites first and we'll suggest what to watch next."
              : "Couldn't generate recommendations right now. Try refreshing."}
          </p>
          {favorites.length > 0 && (
            <Button onClick={() => fetchRecommendations(favorites, reviews)} size="sm">Try again</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
