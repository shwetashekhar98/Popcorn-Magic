"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PickCard } from "@/components/profile/PickCard";
import type { RailPick } from "@/app/api/recommendations/route";
import type { Id } from "@/../convex/_generated/dataModel";

interface Props {
  title: string;
  picks: RailPick[];
  loading: boolean;
  error: string | null;
  userId: Id<"users">;
  onRetry: () => void;
  onRefresh: () => void;
}

function SkeletonCard() {
  return (
    <div className="w-36 flex-shrink-0 space-y-2">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function RecommendationRail({
  title,
  picks,
  loading,
  error,
  userId,
  onRetry,
  onRefresh,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between group/header">
        <h3 className="font-semibold text-base">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="opacity-0 group-hover/header:opacity-100 transition-opacity gap-1.5 text-xs h-7"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-3 py-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="text-xs">
            Retry
          </Button>
        </div>
      ) : loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : picks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No picks available.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {picks.map((pick) => (
            <PickCard key={pick.tmdbId} pick={pick} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
