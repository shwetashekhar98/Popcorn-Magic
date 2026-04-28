"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Heart } from "lucide-react";
import { RecommendationRail } from "@/components/profile/RecommendationRail";
import type { RailPick } from "@/app/api/recommendations/route";
import type { Id } from "@/../convex/_generated/dataModel";

type Section = "becauseYouLoved" | "topGenres" | "hiddenGems" | "different";

const RAIL_TITLES: Record<Section, string> = {
  becauseYouLoved: "Because you loved…",
  topGenres: "More from your top genres",
  hiddenGems: "Hidden gems",
  different: "Try something different",
};

const SECTIONS: Section[] = [
  "becauseYouLoved",
  "topGenres",
  "hiddenGems",
  "different",
];

interface RailState {
  picks: RailPick[];
  anchorTitle?: string;
  loading: boolean;
  error: string | null;
  hidden: boolean;
}

type RailsState = Record<Section, RailState>;

function initialRailState(): RailState {
  return { picks: [], loading: true, error: null, hidden: false };
}

interface Props {
  userId: Id<"users">;
}

export function AiPicksTab({ userId }: Props) {
  const favorites = useQuery(api.favorites.listMine, { userId });

  const [rails, setRails] = useState<RailsState>(() =>
    Object.fromEntries(SECTIONS.map((s) => [s, initialRailState()])) as RailsState
  );

  const fetchSection = useCallback(
    async (section: Section, force = false) => {
      setRails((prev) => ({
        ...prev,
        [section]: { ...prev[section], loading: true, error: null },
      }));

      try {
        const url = `/api/recommendations?section=${section}${force ? "&force=1" : ""}`;
        const res = await fetch(url);

        if (res.status === 204) {
          setRails((prev) => ({
            ...prev,
            [section]: { ...prev[section], loading: false, hidden: true },
          }));
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as {
          picks: RailPick[];
          anchorTitle?: string;
          cached: boolean;
        };

        setRails((prev) => ({
          ...prev,
          [section]: {
            picks: data.picks,
            anchorTitle: data.anchorTitle,
            loading: false,
            error: null,
            hidden: false,
          },
        }));
      } catch (err) {
        setRails((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load",
          },
        }));
      }
    },
    []
  );

  const hasEnoughFavorites = (favorites?.length ?? 0) >= 3;

  useEffect(() => {
    if (!hasEnoughFavorites) return;
    SECTIONS.forEach((s) => fetchSection(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnoughFavorites]);

  function handleRefreshAll() {
    SECTIONS.forEach((s) => fetchSection(s, true));
  }

  if (favorites === undefined) {
    return (
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <RecommendationRail
            key={s}
            title={RAIL_TITLES[s]}
            picks={[]}
            loading
            error={null}
            userId={userId}
            onRetry={() => fetchSection(s)}
            onRefresh={() => fetchSection(s, true)}
          />
        ))}
      </div>
    );
  }

  if (favorites.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Heart className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground max-w-xs">
          Favorite at least 3 titles to unlock personalized picks.
        </p>
      </div>
    );
  }

  const anyLoading = SECTIONS.some((s) => rails[s].loading);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">AI Picks For You</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshAll}
          disabled={anyLoading}
          className="gap-2 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${anyLoading ? "animate-spin" : ""}`} />
          Refresh all
        </Button>
      </div>

      {SECTIONS.filter((s) => !rails[s].hidden).map((section) => {
        const rail = rails[section];
        const title =
          section === "becauseYouLoved" && rail.anchorTitle && !rail.loading
            ? `Because you loved ${rail.anchorTitle}`
            : RAIL_TITLES[section];

        return (
          <RecommendationRail
            key={section}
            title={title}
            picks={rail.picks}
            loading={rail.loading}
            error={rail.error}
            userId={userId}
            onRetry={() => fetchSection(section)}
            onRefresh={() => fetchSection(section, true)}
          />
        );
      })}
    </div>
  );
}
