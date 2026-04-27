import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const mediaTypeValidator = v.union(v.literal("movie"), v.literal("tv"));

export const listByMedia = query({
  args: { mediaType: mediaTypeValidator, mediaId: v.number() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_media", (q) =>
        q.eq("mediaType", args.mediaType).eq("mediaId", args.mediaId)
      )
      .order("desc")
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const upsert = mutation({
  args: {
    userId: v.id("users"),
    mediaType: mediaTypeValidator,
    mediaId: v.number(),
    rating: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 10) {
      throw new Error("Rating must be an integer between 1 and 10");
    }

    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("mediaType"), args.mediaType),
          q.eq(q.field("mediaId"), args.mediaId)
        )
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        text: args.text,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("reviews", {
      userId: args.userId,
      mediaType: args.mediaType,
      mediaId: args.mediaId,
      rating: args.rating,
      text: args.text,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { reviewId: v.id("reviews"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    if (review.userId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.reviewId);
  },
});
