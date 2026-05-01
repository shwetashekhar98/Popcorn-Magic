export const maxDuration = 60;

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import Anthropic from "@anthropic-ai/sdk";
import { api } from "@/../convex/_generated/api";
import { buildTasteProfile } from "@/lib/taste";
import { searchByTitleYear, discoverHiddenGems } from "@/lib/tmdb/endpoints";
import type { Id } from "@/../convex/_generated/dataModel";

type Section = "becauseYouLoved" | "topGenres" | "hiddenGems" | "different";
type MediaType = "movie" | "tv";

export interface RailPick {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterPath: string | null;
  reason: string;
}

interface ClaudePick {
  title: string;
  year: string;
  mediaType: MediaType;
  reason: string;
}

const VALID_SECTIONS = new Set<Section>([
  "becauseYouLoved",
  "topGenres",
  "hiddenGems",
  "different",
]);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

const CLAUDE_SYSTEM =
  "You are a film and TV recommender. Respond with JSON only matching the provided schema — no markdown, no commentary. Never repeat titles in the user's lovedExamples, excludedTitles, or avoidTitles. The reason field must reference concrete elements of the user's taste (specific titles, genres, or rating patterns) — no generic phrasing like \"you'll love this.\"";

async function callClaude(
  payload: object,
  excludedTitles: string[],
  retries = 0
): Promise<ClaudePick[]> {
  const message = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: CLAUDE_SYSTEM,
    messages: [
      { role: "user", content: JSON.stringify({ ...payload, excludedTitles }) },
    ],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text response from Claude");

  try {
    const parsed = JSON.parse(block.text) as { picks?: ClaudePick[] };
    return Array.isArray(parsed.picks) ? parsed.picks : [];
  } catch {
    if (retries < 1) return callClaude(payload, excludedTitles, retries + 1);
    return [];
  }
}

async function buildRailPicks(
  claudePicks: ClaudePick[],
  targetCount: number,
  payload: object,
  avoidTitles: string[]
): Promise<RailPick[]> {
  const picks: RailPick[] = [];
  const excludedTitles: string[] = [];
  let pending = claudePicks;

  for (let attempt = 0; picks.length < targetCount && attempt <= 2; attempt++) {
    if (attempt > 0) {
      pending = await callClaude(
        { ...payload, count: targetCount - picks.length },
        [...avoidTitles, ...excludedTitles]
      );
    }

    for (const cp of pending) {
      if (picks.length >= targetCount) break;
      const result = await searchByTitleYear(cp.title, cp.year, cp.mediaType);
      if (!result) {
        excludedTitles.push(cp.title);
        continue;
      }
      picks.push({
        tmdbId: result.id,
        mediaType: cp.mediaType,
        title: cp.title,
        year: cp.year,
        posterPath: result.poster_path,
        reason: cp.reason.slice(0, 120),
      });
    }
    if (picks.length >= targetCount) break;
  }

  return picks;
}

export async function GET(req: Request) {
  try {
  if (!convex) {
    return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sectionParam = url.searchParams.get("section") ?? "";
  const force = url.searchParams.get("force") === "1";

  if (!VALID_SECTIONS.has(sectionParam as Section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
  const section = sectionParam as Section;

  const convexUser = await convex.query(api.users.current, { clerkId });
  if (!convexUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userId = convexUser._id as Id<"users">;

  const generationId = crypto.randomUUID();
  const generatedAt = Date.now();

  if (!force) {
    const cached = await convex.query(api.recommendations.getCached, { userId, section });
    if (cached && cached.picks.length > 0) {
      return NextResponse.json({
        section,
        anchorTitle: cached.anchorTitle,
        picks: cached.picks as RailPick[],
        cached: true,
      });
    }
  }

  const [favorites, reviews, upFeedback, downFeedback] = await Promise.all([
    convex.query(api.favorites.listMine, { userId }),
    convex.query(api.reviews.listByUser, { userId }),
    convex.query(api.feedback.listForUser, { userId, signal: "up" }),
    convex.query(api.feedback.listForUser, { userId, signal: "down" }),
  ]);

  const profile = await buildTasteProfile(
    userId,
    favorites.slice(0, 20),
    reviews.slice(0, 20)
  );

  if (section === "different" && profile.topGenres.length < 3) {
    return new Response(null, { status: 204 });
  }

  const avoidTitles = downFeedback
    .map((f) => f.title)
    .filter((t): t is string => typeof t === "string");

  const upTitles = upFeedback
    .map((f) => f.title)
    .filter((t): t is string => typeof t === "string");

  const allLovedExamples = [
    ...profile.lovedExamples,
    ...upTitles.map((t) => ({ title: t, rating: 10, genres: [] as number[] })),
  ].slice(0, 10);

  const favTitles = favorites.map((f) => f.title);

  let picks: RailPick[] = [];
  let anchorTitle: string | undefined;

  if (section === "becauseYouLoved") {
    const reviewsByMedia = new Map<string, number>();
    for (const r of reviews) {
      reviewsByMedia.set(`${r.mediaType}:${r.mediaId}`, r.rating);
    }
    const sortedFavs = [...favorites].sort((a, b) => {
      const ra = reviewsByMedia.get(`${a.mediaType}:${a.mediaId}`) ?? 0;
      const rb = reviewsByMedia.get(`${b.mediaType}:${b.mediaId}`) ?? 0;
      if (rb !== ra) return rb - ra;
      return b.addedAt - a.addedAt;
    });
    anchorTitle = sortedFavs[0]?.title;

    const payload = {
      section,
      anchorTitle,
      tasteProfile: {
        topGenres: profile.topGenres,
        avgRating: profile.avgRating,
        ratingBias: profile.ratingBias,
        mediaSplit: profile.mediaSplit,
      },
      lovedExamples: allLovedExamples,
      dislikedExamples: profile.dislikedExamples,
      avoidTitles,
      count: 4,
    };

    const claudePicks = await callClaude(payload, favTitles);
    picks = await buildRailPicks(claudePicks, 4, payload, avoidTitles);
  } else if (section === "topGenres") {
    const payload = {
      section,
      tasteProfile: {
        topGenres: profile.topGenres,
        avgRating: profile.avgRating,
        ratingBias: profile.ratingBias,
        mediaSplit: profile.mediaSplit,
      },
      lovedExamples: allLovedExamples,
      dislikedExamples: profile.dislikedExamples,
      avoidTitles,
      count: 4,
    };

    const claudePicks = await callClaude(payload, favTitles);
    picks = await buildRailPicks(claudePicks, 4, payload, avoidTitles);
  } else if (section === "hiddenGems") {
    const topTwoIds = profile.topGenres.slice(0, 2).map((g) => g.id);

    if (topTwoIds.length > 0) {
      const genreName = profile.topGenres
        .slice(0, 2)
        .map((g) => g.name)
        .join("/");

      const movieCount = Math.round(4 * profile.mediaSplit);
      const tvCount = 4 - movieCount;

      const [movieGems, tvGems] = await Promise.all([
        movieCount > 0 ? discoverHiddenGems("movie", topTwoIds, movieCount) : Promise.resolve([]),
        tvCount > 0 ? discoverHiddenGems("tv", topTwoIds, tvCount) : Promise.resolve([]),
      ]);

      picks = [...movieGems, ...tvGems].map((item) => ({
        tmdbId: item.id,
        mediaType: item.mediaType,
        title: item.title,
        year: item.year,
        posterPath: item.posterPath,
        reason: `Lesser-known ${genreName} pick with strong reviews`,
      }));
    }
  } else if (section === "different") {
    const topGenreIds = profile.topGenres.map((g) => g.id);

    const payload = {
      section,
      tasteProfile: {
        topGenres: profile.topGenres,
        avgRating: profile.avgRating,
        ratingBias: profile.ratingBias,
        mediaSplit: profile.mediaSplit,
      },
      lovedExamples: allLovedExamples,
      dislikedExamples: profile.dislikedExamples,
      avoidTitles,
      instruction: `Recommend titles that fall OUTSIDE these genre IDs: ${topGenreIds.join(", ")}. Explore completely different territory from the user's usual preferences.`,
      count: 4,
    };

    const claudePicks = await callClaude(payload, favTitles);
    picks = await buildRailPicks(claudePicks, 4, payload, avoidTitles);
  }

  if (picks.length > 0) {
    await convex.mutation(api.recommendations.save, {
      userId,
      section,
      anchorTitle,
      picks,
      generationId,
      generatedAt,
    });
  }

  return NextResponse.json({ section, anchorTitle, picks, cached: false });
  } catch (err) {
    console.error("[recommendations]", err);
    let message = "Internal server error";
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        message = parsed?.error?.message ?? parsed?.message ?? err.message;
      } catch {
        message = err.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
