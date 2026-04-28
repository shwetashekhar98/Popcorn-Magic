import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const mediaTypeValidator = v.union(v.literal("movie"), v.literal("tv"));
const signalValidator = v.union(v.literal("up"), v.literal("down"));

const SECTIONS = [
  "becauseYouLoved",
  "topGenres",
  "hiddenGems",
  "different",
] as const;

export const record = mutation({
  args: {
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: mediaTypeValidator,
    signal: signalValidator,
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("recommendation_feedback", {
      userId: args.userId,
      tmdbId: args.tmdbId,
      mediaType: args.mediaType,
      signal: args.signal,
      title: args.title,
      createdAt: Date.now(),
    });

    if (args.signal === "down") {
      for (const section of SECTIONS) {
        const row = await ctx.db
          .query("recommendations")
          .withIndex("by_user_section", (q) =>
            q.eq("userId", args.userId).eq("section", section)
          )
          .unique();
        if (row && row.picks.some((p) => p.tmdbId === args.tmdbId)) {
          await ctx.db.delete(row._id);
          break;
        }
      }
    }
  },
});

export const listForUser = query({
  args: { userId: v.id("users"), signal: signalValidator },
  handler: async (ctx, args) => {
    return ctx.db
      .query("recommendation_feedback")
      .withIndex("by_user_signal", (q) =>
        q.eq("userId", args.userId).eq("signal", args.signal)
      )
      .order("desc")
      .take(20);
  },
});
