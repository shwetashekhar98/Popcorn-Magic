import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const mediaTypeValidator = v.union(v.literal("movie"), v.literal("tv"));

export const listMine = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const toggle = mutation({
  args: {
    userId: v.id("users"),
    mediaType: mediaTypeValidator,
    mediaId: v.number(),
    title: v.string(),
    posterPath: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_media", (q) =>
        q
          .eq("userId", args.userId)
          .eq("mediaType", args.mediaType)
          .eq("mediaId", args.mediaId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }

    await ctx.db.insert("favorites", {
      userId: args.userId,
      mediaType: args.mediaType,
      mediaId: args.mediaId,
      title: args.title,
      posterPath: args.posterPath,
      addedAt: Date.now(),
    });
    return { favorited: true };
  },
});

export const isFavorited = query({
  args: {
    userId: v.id("users"),
    mediaType: mediaTypeValidator,
    mediaId: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_media", (q) =>
        q
          .eq("userId", args.userId)
          .eq("mediaType", args.mediaType)
          .eq("mediaId", args.mediaId)
      )
      .unique();
    return existing !== null;
  },
});
