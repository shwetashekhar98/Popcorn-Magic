import { defineSchema, defineTable } from "convex/server";
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

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  reviews: defineTable({
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: mediaTypeValidator,
    rating: v.number(),
    text: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_media", ["mediaType", "mediaId"])
    .index("by_user", ["userId"]),

  favorites: defineTable({
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: mediaTypeValidator,
    title: v.string(),
    posterPath: v.union(v.string(), v.null()),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_media", ["userId", "mediaType", "mediaId"]),

  recommendations: defineTable({
    userId: v.id("users"),
    section: sectionValidator,
    anchorTitle: v.optional(v.string()),
    picks: v.array(pickValidator),
    generatedAt: v.number(),
    generationId: v.string(),
  }).index("by_user_section", ["userId", "section"]),

  recommendation_feedback: defineTable({
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: mediaTypeValidator,
    signal: v.union(v.literal("up"), v.literal("down")),
    title: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_signal", ["userId", "signal"]),
});
