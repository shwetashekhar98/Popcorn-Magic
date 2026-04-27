import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface FavoriteItem {
  title: string;
  mediaType: "movie" | "tv";
}

interface ReviewItem {
  title?: string;
  mediaType: "movie" | "tv";
  rating: number;
}

export interface Recommendation {
  title: string;
  mediaType: "movie" | "tv";
  reason: string;
  genre: string;
}

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { favorites, reviews }: { favorites: FavoriteItem[]; reviews: ReviewItem[] } = await req.json();

    if (favorites.length === 0 && reviews.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const favList = favorites.map((f) => `${f.title} (${f.mediaType})`).join(", ");
    const reviewList = reviews
      .filter((r) => r.title)
      .map((r) => `${r.title} (${r.mediaType}) — rated ${r.rating}/10`)
      .join(", ");

    const prompt = `You are a movie and TV recommendation expert. Based on the user's taste, suggest 6 titles they would love.

User's favorites: ${favList || "none"}
User's reviews: ${reviewList || "none"}

Return ONLY a valid JSON array of exactly 6 objects. No markdown, no explanation, just the raw JSON array.
Each object must have these exact fields:
- "title": string (the movie or TV show name)
- "mediaType": "movie" or "tv"
- "reason": string (one sentence explaining why they'd love it, max 15 words)
- "genre": string (one or two words, e.g. "Thriller" or "Sci-Fi Drama")

Recommend titles NOT already in their favorites. Mix movies and TV shows.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const recommendations: Recommendation[] = JSON.parse(text);

    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json({ recommendations: [], error: "Failed to generate recommendations" }, { status: 500 });
  }
}
