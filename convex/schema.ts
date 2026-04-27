import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
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
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    title: v.string(),
    posterPath: v.union(v.string(), v.null()),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_media", ["userId", "mediaType", "mediaId"]),
});
