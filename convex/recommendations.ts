import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const mediaTypeValidator = v.union(v.literal("movie"), v.literal("tv"));

const sectionValidator = v.union(
  v.literal("becauseYouLoved"),
  v.literal("topGenres"),
  v.literal("hiddenGems"),
  v.literal("different")
);

const pickValidator = v.object({
  tmdbId: v.number(),
  mediaType: mediaTypeValidator,
  title: v.string(),
  year: v.string(),
  posterPath: v.union(v.string(), v.null()),
  reason: v.string(),
});

const CACHE_TTL = 24 * 60 * 60 * 1000;

export const getCached = query({
  args: { userId: v.id("users"), section: sectionValidator },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("recommendations")
      .withIndex("by_user_section", (q) =>
        q.eq("userId", args.userId).eq("section", args.section)
      )
      .unique();
    if (!row) return null;
    if (Date.now() - row.generatedAt > CACHE_TTL) return null;
    return row;
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    section: sectionValidator,
    anchorTitle: v.optional(v.string()),
    picks: v.array(pickValidator),
    generationId: v.string(),
    generatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("recommendations")
      .withIndex("by_user_section", (q) =>
        q.eq("userId", args.userId).eq("section", args.section)
      )
      .unique();

    if (existing && existing.generatedAt >= args.generatedAt) return;

    if (existing) {
      await ctx.db.patch(existing._id, {
        anchorTitle: args.anchorTitle,
        picks: args.picks,
        generatedAt: args.generatedAt,
        generationId: args.generationId,
      });
    } else {
      await ctx.db.insert("recommendations", {
        userId: args.userId,
        section: args.section,
        anchorTitle: args.anchorTitle,
        picks: args.picks,
        generatedAt: args.generatedAt,
        generationId: args.generationId,
      });
    }
  },
});

export const invalidateSection = mutation({
  args: { userId: v.id("users"), section: sectionValidator },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("recommendations")
      .withIndex("by_user_section", (q) =>
        q.eq("userId", args.userId).eq("section", args.section)
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
